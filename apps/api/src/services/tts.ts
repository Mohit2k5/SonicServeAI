interface TtsResult {
  audioBuffer: Buffer;
  mimeType: string;
}

export async function textToSpeech(text: string, voiceModel: string = 'alloy'): Promise<TtsResult> {
  const normalizedText = typeof text === 'string' ? text.trim() : '';
  if (!normalizedText) {
    throw new Error('TTS input is empty after normalization.');
  }

  // Google Translate TTS is 100% free but limits requests to 200 characters each.
  // We chunk sentences and stitch the audio buffers.
  const chunks = normalizedText.match(/[^.!?]+[.!?]*|.+/g) || [normalizedText];
  const buffers: Buffer[] = [];

  for (let chunk of chunks) {
    chunk = chunk.trim();
    if (!chunk) continue;
    
    // Fallback if a chunk is still over 200 somehow
    while (chunk.length > 0) {
      const subChunk = chunk.substring(0, 200);
      chunk = chunk.substring(200);
      
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(subChunk)}&tl=en&client=tw-ob`;
      
      const res = await fetch(url);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        buffers.push(Buffer.from(arrayBuffer));
      } else {
        console.warn(`[TTS] Free Google TTS chunk failed with status: ${res.status}`);
      }
    }
  }

  if (buffers.length === 0) {
    throw new Error('Failed to generate any TTS audio via free endpoint.');
  }

  return { audioBuffer: Buffer.concat(buffers), mimeType: 'audio/mpeg' };
}
