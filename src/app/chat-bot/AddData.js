import fs from 'fs/promises';
import * as cheerio from "cheerio";
import path from 'path'

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