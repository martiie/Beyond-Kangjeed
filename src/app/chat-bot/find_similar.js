// find_similar.js
'use server';

import fs from 'fs/promises';
import path from 'path';
import { dataset } from './dataset';

export async function loadData() {
  try {
    const filePath = path.join(__dirname, 'src', 'app', 'chat-bot', 'qa_data.json');
    const rawData = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(rawData);

    data.forEach(entry => {
      if (entry.embedding && !Array.isArray(entry.embedding)) {
        entry.embedding = Array.from(entry.embedding);
      }
    });

    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    throw new Error('Failed to load qa_data.json file: ' + error.message);
  }
}

export async function findSimilar(query, similarityThreshold = 0.8) {
  try {
    const queryEmbedding = await generateEmbedding(query);
    const data = await loadData();

    const similarities = data.map(entry => {
      const score = cosineSimilarity(queryEmbedding, entry.embedding);
      return { entry, score };
    });
    const resolvedSimilarities = await Promise.all(
      similarities.map(async (item) => {
        const score = await item.score;
        return { ...item, score };
      })
    );
    
    const sortedSimilarities = resolvedSimilarities.sort((a, b) => b.score - a.score);
    // console.log('queryEmbedding:',sortedSimilarities);

    const topEntry = sortedSimilarities[0];
    const score = await topEntry?.score;
    // console.log('topEntry?.entry:',topEntry?.entry)
    console.log('RAG Score:', score);

    if (score >= similarityThreshold) {
      console.log('RAG');
      const answer = topEntry.entry.answer;
      const refinedAnswer = await refineAnswerWithGPT(answer);
      return refinedAnswer;
    } else {
      console.log('GPT');
      return await fetchGPTResponse([{ role: 'user', content: query }]);
    }
  } catch (error) {
    console.error('Error finding similar entry:', error);
    throw new Error('Failed to find similar entry: ' + error.message);
  }
}
async function refineAnswerWithGPT(answer) {
  const response = await fetchGPTResponse([
      { role: 'system', content: 'โปรดปรับแต่งและจัดระเบียบข้อความต่อไปนี้ให้อยู่ในรูปแบบที่สอดคล้องกันและอ่านง่ายยิ่งขึ้น และถ้ามีการแบ่งเป็นข้อๆให้เว้นบรรทัด' },
      { role: 'user', content: `${answer}` }
  ]);

  return response;  
}

async function fetchGPTResponse(messages) {
  const fullMessages = [...dataset, ...messages];
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: fullMessages,
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
