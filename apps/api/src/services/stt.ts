export async function speechToText(audioBuffer: Buffer, languageCode: string = 'en'): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[STT] Error: GEMINI_API_KEY is missing from environment variables');
    return '';
  }

  try {
    const base64Audio = audioBuffer.toString('base64');
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const langInstruction = languageCode.startsWith('hi') ? 'in Hindi script' : 'in English';

    const body = {
      contents: [
        {
          parts: [
            { text: `You are an expert transcriber. Transcribe the following audio exactly as spoken ${langInstruction}. Output ONLY the transcribed text without quotes, formatting, or commentary. Do not invent speech if there is silence.` },
            {
              inlineData: {
                mimeType: 'audio/webm',
                data: base64Audio
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[STT] Gemini Error (${res.status}): ${errorBody}`);
      return '';
    }

    const data = await res.json() as any;
    const transcript = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log(`[STT] Transcribed: "${transcript.trim()}"`);
    return transcript.trim();
  } catch (error) {
    console.error(`[STT] Fatal error connecting to Gemini:`, error);
    return '';
  }
}
