'use server';
///
import fetch from 'node-fetch';
import { prompt } from '../../data/prompt';
import dataset from '../../data/knowledge.json';

// ค้นหาด้วย BM25 (keyword search)
const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
const BM25_K1 = 1.5;
const BM25_B = 0.75;

// คำที่ความหมายเดียวกัน ให้นับเป็น token เดียวกัน
const SYNONYMS = { 'เอชไอวี': 'hiv', 'เอดส์': 'aids', 'เพร็พ': 'prep', 'เป๊ป': 'pep' };
// คำลงท้ายคำถาม ไม่ช่วยในการค้นหา
const STOPWORDS = new Set(['ไหม', 'มั้ย', 'มั๊ย', 'อะไร', 'คือ', 'ยังไง', 'อย่างไร', 'ไง', 'บ้าง', 'ครับ', 'ค่ะ', 'คะ', 'นะ', 'หรือ', 'หรือเปล่า', 'เปล่า']);

function tokenize(text) {
  return [...segmenter.segment(text.toLowerCase())]
    .filter(s => s.isWordLike)
    .map(s => SYNONYMS[s.segment] || s.segment)
    .filter(t => !STOPWORDS.has(t));
}

// สร้าง index ครั้งเดียวตอนโหลด module
const docs = dataset
  .filter(entry => entry.content)
  .map(entry => {
    const tokens = tokenize(entry.content);
    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
    return { content: entry.content, tf, length: tokens.length };
  });
const avgDocLength = docs.reduce((sum, d) => sum + d.length, 0) / docs.length;
const docFreq = new Map();
for (const d of docs) {
  for (const t of d.tf.keys()) docFreq.set(t, (docFreq.get(t) || 0) + 1);
}

function bm25Search(query, topK) {
  const queryTokens = [...new Set(tokenize(query))];
  return docs
    .map(d => {
      let score = 0;
      for (const t of queryTokens) {
        const f = d.tf.get(t);
        if (!f) continue;
        const n = docFreq.get(t);
        const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
        score += idf * (f * (BM25_K1 + 1)) / (f + BM25_K1 * (1 - BM25_B + BM25_B * d.length / avgDocLength));
      }
      return { content: d.content, score };
    })
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export async function findSimilar(query) {
  try {
    // ดึงข้อมูลที่เกี่ยวข้องที่สุดจาก knowledge.json
    const topSimilar = bm25Search(query, 10);
    // console.log('Top similar entries:', topSimilar);
    const contextString = topSimilar.map(item => item.content).join('\n');
    const answer = await generateAnswer(query, contextString);
    // console.log('Generated answer:', answer);
    // ไม่เก็บประวัติลง prompt (global ของ server) เพราะจะปนกันข้ามผู้ใช้และ context ยาวขึ้นเรื่อยๆ

    return answer;
  } catch (error) {
    console.error('Error in findSimilar:', error);
    throw new Error('Failed to process query: ' + error.message);
  }
}

async function generateAnswer(query, context) {
  const messages = [
    ...prompt,
    { role: 'system', content: `ข้อมูลอ้างอิงสำหรับตอบคำถาม:\n${context}` },
    { role: 'user', content: query }
  ];

  return await fetchGPTResponse(messages);
}

export async function fetchGPTResponse(messages) {
  const response = await fetch("http://thaillm.or.th/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.THAILLM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openthaigpt-thaillm-8b-instruct-v7.2",
      messages: messages,
      max_tokens: 2048,
      temperature: 0.3,
    }),
  });

  // ThaiLLM อาจตอบ error เป็น HTML ไม่ใช่ JSON
  const text = await response.text();
  let responseBody;
  try {
    responseBody = JSON.parse(text);
  } catch {
    console.error('ThaiLLM API Error:', response.status, text.slice(0, 200));
    throw new Error(`ThaiLLM API error (HTTP ${response.status})`);
  }
  if (!response.ok) {
    console.error('ThaiLLM API Error:', responseBody);
    throw new Error(responseBody.error?.message || 'Failed to fetch response');
  }

  // โมเดลส่ง <think>...</think> มาก่อนคำตอบจริง ตัดออก
  const content = responseBody.choices[0].message.content || '';
  return content.replace(/<think>[\s\S]*?(<\/think>|$)/g, '').trim();
}
