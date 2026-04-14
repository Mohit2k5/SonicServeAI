interface Message { role: 'user' | 'assistant' | 'system'; content: string; }

export async function runLLM(
  messages: Message[],
  systemPrompt: string,
  agentContext?: any
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const history = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  // Double-security: Add system prompt as the first message AND as systemInstruction
  // This ensures that even Gemini 3 (experimental) will see the instructions.
  const contents = [
    {
      role: 'user',
      parts: [{ text: `SYSTEM INSTRUCTIONS (OBEY THESE): ${systemPrompt}` }]
    },
    ...history
  ];

  const body = {
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.8
    }
  };

  console.log(`[LLM] Calling Gemini 3 with ${history.length} messages and system prompt length ${systemPrompt.length}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`[LLM] Gemini API error: ${errorBody}`);
    throw new Error(`Gemini API error (${res.status}): ${errorBody}`);
  }

  const data = await res.json() as any;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  if (!text) {
    console.warn('[LLM] Received empty response from Gemini. Data:', JSON.stringify(data));
  } else {
    console.log(`[LLM] Response received: "${text.substring(0, 50)}..."`);
  }
  
  return text;
}

