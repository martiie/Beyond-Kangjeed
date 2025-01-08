'use server';

import fs from 'fs/promises';
import fetch from 'node-fetch';
import * as cheerio from "cheerio";
import { dataset } from '../../data/dataset';
import { qa_data } from '../../data/qa_data';

export async function loadData() {
  try {
    console.log('Loaded data:', qa_data);
    qa_data.forEach(entry => {
      if (entry.embedding && !Array.isArray(entry.embedding)) {
        entry.embedding = Array.from(entry.embedding);
      }
    });
    return qa_data;
  } catch (error) {
    console.error('Error loading data:', error);
    throw new Error('Failed to load qa_data: ' + error.message);
  }
}

export async function findSimilar(query) {
  try {
    console.log('Processing query:', query);
    const queryEmbedding = await generateEmbedding(query);
    const data = await loadData();

    const topSimilarChunks = await semanticSearch(queryEmbedding, data, 20);
    console.log('Top similar chunks:', topSimilarChunks);

    // ตรวจสอบคะแนนของคำตอบที่คล้ายที่สุด
    if (topSimilarChunks.length > 0 && topSimilarChunks[0].score >= 0.8) {
      const bestMatch = topSimilarChunks[0].entry;
      if (bestMatch.question && bestMatch.answer) {
        console.log('High similarity found, using answer from qa_data:', bestMatch.answer);
        return bestMatch.answer;
      }
    }

    // Combine similar chunks into a single context
    const combinedContext = topSimilarChunks.map(chunk => chunk.entry.content || chunk.entry.answer).join('\n\n');

    // Generate answer using the combined context
    const answer = await generateAnswer(query, combinedContext);
    console.log('Generated answer:', answer);

    // Add query and answer to dataset
    dataset.push({ role: 'user', content: query });
    dataset.push({ role: 'assistant', content: answer });

    return answer;
  } catch (error) {
    console.error('Error in findSimilar:', error);
    throw new Error('Failed to process query: ' + error.message);
  }
}

async function semanticSearch(queryEmbedding, data, topN) {
  const similarities = await Promise.all(data.map(async (entry) => {
    const score = await cosineSimilarity(queryEmbedding, entry.embedding);
    return { entry, score };
  }));

  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

async function generateAnswer(query, context) {
  const messages = [
    ...dataset,
    { role: 'system', content: 'You are a helpful assistant. Use the following context to answer the user\'s question. If the answer is not in the context, use your general knowledge to provide a relevant answer. If you really don\'t have enough information, say "I don\'t have enough information to answer that question."' },
    { role: 'user', content: `Context: ${context}\n\nQuestion: ${query}` }
  ];
  
  return await fetchGPTResponse(messages);
}

export async function fetchGPTResponse(messages) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7, // Add temperature for more varied responses
      max_tokens: 300, // Limit response length
    }),
  });

  const responseBody = await response.json();
  if (!response.ok) {
    console.error('OpenAI API Error:', responseBody);
    throw new Error(responseBody.error?.message || 'Failed to fetch response');
  }

  return responseBody.choices[0].message.content;
}

export async function generateEmbedding(text) {
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });

    const responseBody = await response.json();
    if (!response.ok) {
      console.error('OpenAI API Error:', responseBody);
      throw new Error(responseBody.error?.message || 'Failed to generate embedding');
    }

    console.log('Generated Embedding:', responseBody.data[0].embedding);
    return responseBody.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding: ' + error.message);
  }
}

export async function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

function splitTextIntoChunks(text, maxTokens = 4000) {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = '';

  for (const word of words) {
    if ((currentChunk + ' ' + word).length > maxTokens) {
      chunks.push(currentChunk.trim());
      currentChunk = word;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + word;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export async function addDataFromWebsite(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch URL: ${url}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    let text = $('body').text().replace(/\s+/g, ' ').trim();

    const chunks = splitTextIntoChunks(text);
    let successCount = 0;
    let errorCount = 0;

    for (const chunk of chunks) {
      try {
        const embedding = await generateEmbedding(chunk);
        const newEntry = { 
          source: url, 
          content: chunk, 
          embedding: embedding,
          title: $('title').text(),
          section: '' // You could try to extract section information if available
        };

        qa_data.push(newEntry);
        successCount++;
        console.log(`Added new entry from website (${successCount}/${chunks.length})`);
      } catch (embeddingError) {
        errorCount++;
        console.error(`Error generating embedding for chunk ${successCount + errorCount}/${chunks.length}:`, embeddingError);
      }
    }

    if (errorCount > 0) {
      console.warn(`Completed with ${errorCount} errors. ${successCount} entries were successfully added.`);
    } else {
      console.log(`All ${successCount} entries were successfully added from the website.`);
    }
  } catch (error) {
    console.error('Error processing website:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
}

export async function addDataFromJSON(jsonPath) {
  try {
    const jsonData = await fs.readFile(jsonPath, "utf8");

    let data;
    try {
      data = JSON.parse(jsonData);
    } catch (parseError) {
      throw new Error(`JSON parsing failed: ${parseError.message}`);
    }

    if (!Array.isArray(data)) {
      throw new Error("JSON data is not an array.");
    }

    let successCount = 0;
    for (const entry of data) {
      try {
        const embedding = await generateEmbedding(entry.content);
        entry.embedding = embedding;
        qa_data.push(entry);
        successCount++;
        console.log(`Successfully added entry (${successCount}/${data.length})`);
      } catch (embeddingError) {
        console.error(`Error generating embedding for entry ${successCount + 1}:`, embeddingError);
      }
    }

    console.log(`Added ${successCount} entries from JSON file.`);
  } catch (error) {
    console.error(`Error processing JSON file: ${error.message}`);
    throw error;
  }
}

export async function addDataFromJSONL(jsonlPath) {
  try {
    const jsonlData = await fs.readFile(jsonlPath, "utf8");
    const lines = jsonlData.split('\n').filter(line => line.trim()); // แยกไฟล์เป็นบรรทัดและตัดบรรทัดว่างออก

    let successCount = 0;
    for (const line of lines) {
      try {
        const entry = JSON.parse(line); // แปลงแต่ละบรรทัดเป็น JSON Object
        const embedding = await generateEmbedding(entry.content);
        entry.embedding = embedding; // เพิ่ม embedding ลงใน entry
        qa_data.push(entry); // เพิ่ม entry ลงใน qa_data
        successCount++;
        console.log(`Successfully added entry (${successCount}/${lines.length})`);
      } catch (error) {
        console.error(`Error processing line ${successCount + 1}:`, error.message);
      }
    }

    console.log(`Added ${successCount} entries from JSONL file.`);
  } catch (error) {
    console.error(`Error processing JSONL file: ${error.message}`);
    throw error;
  }
}

// Example usage
(async () => {
  try {
    //await addDataFromJSONL('src/data/test.jsonl');
    await addDataFromJSON('src/data/test.json');
    //await addDataFromWebsite('https://th.m.wikipedia.org/wiki/%E0%B8%99%E0%B8%B2%E0%B8%A2%E0%B8%81%E0%B8%A3%E0%B8%B1%E0%B8%90%E0%B8%A1%E0%B8%99%E0%B8%95%E0%B8%A3%E0%B8%B5%E0%B9%84%E0%B8%97%E0%B8%A2');
    //await addDataFromWebsite('https://th.m.wikipedia.org/wiki/%E0%B8%A3%E0%B8%B2%E0%B8%A2%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%95%E0%B8%AD%E0%B8%99%E0%B9%83%E0%B8%99%E0%B8%A2%E0%B8%AD%E0%B8%94%E0%B8%99%E0%B8%B1%E0%B8%81%E0%B8%AA%E0%B8%B7%E0%B8%9A%E0%B8%88%E0%B8%B4%E0%B9%8B%E0%B8%A7%E0%B9%82%E0%B8%84%E0%B8%99%E0%B8%B1%E0%B8%99_(%E0%B9%81%E0%B8%AD%E0%B8%99%E0%B8%B4%E0%B9%80%E0%B8%A1%E0%B8%8A%E0%B8%B1%E0%B8%99)');
    console.log("All data added successfully");
  } catch (error) {
    console.error("Error in main execution:", error.message);
  }
})();


