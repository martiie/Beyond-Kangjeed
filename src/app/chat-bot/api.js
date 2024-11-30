
export async function fetchGPTResponse(userMessage) {
    const apiKey = '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'; // แทนที่ด้วย API Key ที่คุณสร้างใหม่จาก OpenAI
 
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: userMessage }
        ]
      }),
    });
  
    const data = await response.json();
    return data;
  }
  
