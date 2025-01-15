'use server';
///
import fetch from 'node-fetch';
import { prompt } from '../../data/prompt';
import dataset from '../../data/knowledge.json';

export async function findSimilar(query) {
  try {
    // สร้าง embedding สำหรับ query
    const queryEmbedding = await generateEmbedding(query);
    
    // ดึงข้อมูลจาก dataset (รวมถึงข้อมูลที่ไม่มี embedding)
    const data = dataset;
    
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
    const topSimilar = validSimilarities.slice(0, 10);
    // console.log('Top similar entries:', topSimilar);
    const contextString = topSimilar.map(item => item.content).join('\n');
    const answer = await generateAnswer(query, contextString);
    // console.log('Generated answer:', answer);

    return answer;
  } catch (error) {
    console.error('Error in findSimilar:', error);
    throw new Error('Failed to process query: ' + error.message);
  }
}

async function generateAnswer(query, context) {
  const messages = [
    ...prompt,
    { role: 'assistant', content: context },
    { role: 'user', content: query }
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

