export async function fetchGPTResponse(messages) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o", // หรือ gpt-3.5-turbo
      messages: messages,  // ส่งประวัติทั้งหมดในรูปแบบ array
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch response");
  }

  return await response.json();
}
