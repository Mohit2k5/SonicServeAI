interface TtsResult {
  audioBuffer: Buffer;
  mimeType: string;
}

export async function textToSpeech(text: string, voiceModel: string = 'aura-asteria-en'): Promise<TtsResult> {
  const normalizedText = typeof text === 'string' ? text.trim() : '';
  if (!normalizedText) {
    throw new Error('TTS input is empty after normalization.');
  }

  const resolvedModel = typeof voiceModel === 'string' && voiceModel.trim().length > 0
    ? voiceModel.trim()
    : 'aura-asteria-en';

  // Deepgram limit is 2000 chars. Truncate if necessary for stability.
  const safeText = normalizedText.slice(0, 1990);

  const res = await fetch(`https://api.deepgram.com/v1/speak?model=${encodeURIComponent(resolvedModel)}&encoding=mp3`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: safeText })
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Deepgram TTS error (${res.status}): ${errorBody}`);
  }

  const mimeType = res.headers.get('content-type') || 'audio/mpeg';
  const arrayBuffer = await res.arrayBuffer();
  return { audioBuffer: Buffer.from(arrayBuffer), mimeType };
}
