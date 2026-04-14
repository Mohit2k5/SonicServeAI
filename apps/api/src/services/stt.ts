import fetch from 'node-fetch';

export async function speechToText(audioBuffer: Buffer, languageCode: string = 'hi'): Promise<string> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPGRAM_API_KEY is missing');
  }

  // Deepgram supports webm directly
  const res = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=' + (languageCode === 'hi' ? 'hi' : 'en'), {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'audio/webm'
    },
    body: audioBuffer
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`[STT] Deepgram error: ${errorBody}`);
    return '';
  }

  const data = await res.json() as any;
  const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
  
  console.log(`[STT] Transcribed: "${transcript}"`);
  return transcript;
}
