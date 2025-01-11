'use server';
///
import fs from 'fs/promises';
import fetch from 'node-fetch';
import * as cheerio from "cheerio";
import { prompt } from '../../data/prompt';
import { dataset } from '../../data/knowledge';
import path from 'path'
// import pdfParse from 'pdf-parse';
// import abc from '../../data/test.json' assert { type: 'json' };
import Wordcut from "wordcut";

Wordcut.init();

// ฟังก์ชันสำหรับ chunk ข้อมูล
function chunkData(content, maxTokens = 500) {
  let tokens = Wordcut.cut(content).split(' '); // แบ่งคำโดยใช้ wordcut สำหรับภาษาไทย
  let chunks = [];

  while (tokens.length > maxTokens) {
    chunks.push(tokens.slice(0, maxTokens).join(' '));
    tokens = tokens.slice(maxTokens);
  }

  if (tokens.length > 0) {
    chunks.push(tokens.join(' '));
  }
  console.log(chunks);

  return chunks;
}

export async function loadData() {
  try {
    // console.log('Loaded data:', dataset);
    dataset.forEach(entry => {
      if (entry.embedding && !Array.isArray(entry.embedding)) {
        entry.embedding = Array.from(entry.embedding);
      }
    });
    return dataset;
  } catch (error) {
    console.error('Error loading data:', error);
    throw new Error('Failed to load dataset: ' + error.message);
  }
}

export async function findSimilar(query) {
  try {
    // สร้าง embedding สำหรับ query
    const queryEmbedding = await generateEmbedding(query);
    
    // ดึงข้อมูลจาก dataset (รวมถึงข้อมูลที่ไม่มี embedding)
    const data = await loadData();
    
    // สร้าง embedding สำหรับ content ใน dataset หากยังไม่มี
    for (let entry of data) {
      if (!entry.embedding && entry.content) {
        // สร้าง embedding สำหรับ content
        entry.embedding = await generateEmbedding(entry.content);
      }
    }

    // คำนวณ cosine similarity ระหว่าง queryEmbedding กับ embedding ของทุก entry ใน dataset
    const similarities = await Promise.all(data.map(async (entry) => {
      if (entry.embedding) {
        const similarityScore = await cosineSimilarity(queryEmbedding, entry.embedding);
        return { ...entry, similarityScore }; // เพิ่ม similarityScore
      }
      return null;
    }));

    // ลบ null ถ้าไม่มี embedding และจัดเรียง similarity score จากมากไปหาน้อย
    const validSimilarities = similarities.filter(item => item !== null);
    validSimilarities.sort((a, b) => b.similarityScore - a.similarityScore);

    // แสดงผลลัพธ์ของข้อมูลที่คล้ายที่สุด
    const topSimilar = validSimilarities.slice(0, 3);
    console.log('Top similar entries:', topSimilar);

    // รวมข้อมูลที่คล้ายที่สุดมาเป็น context
    const combinedContext = topSimilar.map(entry => entry.content || entry.answer).join('\n\n');

    // ซอย combinedContext ออกเป็น chunk ย่อย
    const chunks = chunkText(combinedContext); // 200 คือจำนวนคำหรืออักขระต่อ chunk
    console.log('Chunks:', chunks);

    // สร้าง embedding สำหรับแต่ละ chunk
    const chunkEmbeddings = await Promise.all(chunks.map(chunk => generateEmbedding(chunk)));

    // คำนวณ cosine similarity ระหว่าง queryEmbedding กับ chunkEmbeddings
    const chunkSimilarities = chunkEmbeddings.map((chunkEmbedding, index) => {
      return {
        chunk: chunks[index],
        similarityScore: cosineSimilarity(queryEmbedding, chunkEmbedding),
      };
    });

    // จัดเรียง chunk ตาม similarity score และเลือก top 10
    chunkSimilarities.sort((a, b) => b.similarityScore - a.similarityScore);
    const topChunks = chunkSimilarities.slice(0, 10).map(item => item.chunk);
    console.log('Top chunks:', topChunks);

    // สร้างคำตอบจาก top 10 chunks
    const finalContext = topChunks.join('\n\n');
    const answer = await generateAnswer(query, finalContext);
    console.log('Generated answer:', answer);

    return answer;
  } catch (error) {
    console.error('Error in findSimilar:', error);
    throw new Error('Failed to process query: ' + error.message);
  }
}

// ฟังก์ชันสำหรับซอยข้อความออกเป็น chunk ย่อย
function chunkText(text,numberChunk=30) {
  const chunks = [];
  const words = text.split(/\s+/); // แบ่งข้อความโดยใช้ช่องว่าง
  const chunkSize = Math.ceil(words.length / numberChunk); // ขนาดของ chunk เป็น 1/20 ของจำนวนคำ

  let currentChunk = [];
  
  for (let word of words) {
    if (currentChunk.length >= chunkSize) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
    }
    currentChunk.push(word);
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}


async function generateAnswer(query, context) {
  const messages = [
    ...prompt,
    { role: 'system', content: 'คุณคือคนที่จะช่วยในการตอบปัญหาและให้คำปรึกษาเกี่ยวกับข้อมูลโรคติดต่อทางเพศสัมพันธ์' },
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
      //max_tokens: 300, // Limit response length
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

        dataset.push(newEntry);
        successCount++;
        console.log(`Added new entry from website (${successCount}/${chunks.length})`);
        if (successCount==7) {
          console.log("example data embeding from web:");
          console.log(newEntry);
        };
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

export async function addDataFromJSON(dt) {
  try {
    // const jsonData = await fs.readFile(jsonPath, "utf8");

    let data;
    try {
      data = dt;
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
        dataset.push(entry);
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
        dataset.push(entry); // เพิ่ม entry ลงใน dataset
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

// ฟังก์ชันสำหรับเพิ่มข้อมูลจาก PDF
export async function addDataFromPDF(pdfPath) {
  try {
    const pdfBuffer = await fs.readFile(pdfPath); // อ่านไฟล์ PDF
    const pdfData = await pdfParse(pdfBuffer); // ดึงข้อมูลจาก PDF
    const text = pdfData.text.replace(/\s+/g, ' ').trim(); // ทำความสะอาดข้อความ

    // แยกข้อความเป็น chunks
    const chunks = splitTextIntoChunks(text);
    let successCount = 0;
    let errorCount = 0;

    for (const chunk of chunks) {
      try {
        const embedding = await generateEmbedding(chunk); // สร้าง embedding สำหรับ chunk
        const newEntry = {
          source: path.basename(pdfPath), // ใช้ชื่อไฟล์ PDF เป็นแหล่งที่มา
          content: chunk,
          embedding: embedding,
        };

        dataset.push(newEntry); // เพิ่ม entry ลงใน dataset
        successCount++;
        console.log(`Successfully added entry (${successCount}/${chunks.length})`);
      } catch (error) {
        errorCount++;
        console.error(`Error generating embedding for chunk (${successCount + errorCount}/${chunks.length}):`, error);
      }
    }

    console.log(`Added ${successCount} entries from PDF. Errors: ${errorCount}`);
  } catch (error) {
    console.error(`Error processing PDF file (${pdfPath}):`, error.message);
    throw error;
  }
}

// Example usage
(async () => {
  try {
    //await addDataFromJSONL('src/data/test.jsonl');
    // await addDataFromJSON(abc);
    //await addDataFromPDF(path.join(process.cwd(), 'src', 'data', 'test.pdf'));
    // await addDataFromWebsite('https://th.m.wikipedia.org/wiki/%E0%B8%99%E0%B8%B2%E0%B8%A2%E0%B8%81%E0%B8%A3%E0%B8%B1%E0%B8%90%E0%B8%A1%E0%B8%99%E0%B8%95%E0%B8%A3%E0%B8%B5%E0%B9%84%E0%B8%97%E0%B8%A2');
    // await addDataFromWebsite('https://th.m.wikipedia.org/wiki/%E0%B8%A3%E0%B8%B2%E0%B8%A2%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%95%E0%B8%AD%E0%B8%99%E0%B9%83%E0%B8%99%E0%B8%A2%E0%B8%AD%E0%B8%94%E0%B8%99%E0%B8%B1%E0%B8%81%E0%B8%AA%E0%B8%B7%E0%B8%9A%E0%B8%88%E0%B8%B4%E0%B9%8B%E0%B8%A7%E0%B9%82%E0%B8%84%E0%B8%99%E0%B8%B1%E0%B8%99_(%E0%B9%81%E0%B8%AD%E0%B8%99%E0%B8%B4%E0%B9%80%E0%B8%A1%E0%B8%8A%E0%B8%B1%E0%B8%99)');
    const query = "คุณคือผู้ช่วยคำนวณความเสี่ยงติดเชื้อ";
    const answer = await chunkData(query,100);
    console.log("Answer:", answer);
    console.log("All data added successfully");
  } catch (error) {
    console.error("Error in main execution:", error.message);
  }
})();


