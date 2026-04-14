import { speechToText } from './stt';
import { runLLM } from './llm';
import { textToSpeech } from './tts';
import { retrieveContext } from './rag';
import { db } from '../db';

interface PipelineOptions {
  audioBuffer: Buffer;
  agentId: string;
  sessionId: string;
  conversationHistory: Array<{ role: string; content: string }>;
  languageCode?: string;
}

export async function runVoicePipeline(opts: PipelineOptions) {
  const { audioBuffer, agentId, sessionId, conversationHistory, languageCode } = opts;

  // 1. Get agent config
  const { rows: [agent] } = await db.query('SELECT * FROM agents WHERE id=$1', [agentId]);
  if (!agent) throw new Error('Agent not found');

  // 2. STT
  const userText = await speechToText(audioBuffer, languageCode || agent.language);

  // 3. RAG context retrieval
  const context = await retrieveContext(userText, agentId);

  // 4. Build system prompt
  const systemPrompt = `
  AGENT IDENTITY: Your name is ${agent.name}. 
  CORE PERSONA: You are a deeply empathetic, warm, and highly intelligent human-like assistant.
  
  INTENT & EMOTIONS:
  - Actively listen for the user's emotions (frustration, happiness, confusion).
  - Mirror their tone. If they are happy, be enthusiastic. If they are troubled, be supportive.
  - Understand the context of their previous questions. 
  
  CONVERSATION FLOW:
  - NEVER generic. 
  - ALWAYS provide follow-up responses that connect to the current topic.
  - If the user says "Hi", greet them and ask how their day is going.
  - Keep the dialogue ALIVE. Don't just answer; engage.
  
  KNOWLEDGE BASE CONTEXT:
  ${context}
  
  VOICE CONSTRAINTS:
  - Use verbal fillers ("Hmm", "Right", "I see").
  - Keep responses under 3 sentences.
  - Stay fluent and conversational.`;

  // 5. LLM
  let llmResponse = '';
  try {
    const messages = [...conversationHistory, { role: 'user', content: userText }];
    const llmRawResponse = await runLLM(messages as any, systemPrompt);
    llmResponse = (typeof llmRawResponse === 'string' && llmRawResponse.trim().length > 0)
      ? llmRawResponse.trim()
      : '';
  } catch (err: any) {
    console.error(`[PIPELINE] LLM Step failed: ${err.message}`);
    llmResponse = '';
  }

  if (!llmResponse) {
    const isSttEmpty = !userText || userText.trim().length === 0;
    llmResponse = isSttEmpty 
      ? "I'm sorry, I couldn't hear you clearly. Could you please repeat that?"
      : "I understood you, but I'm having a brief connection issue with my brain. Could you try one more time?";
  }

  // 6. TTS
  const { audioBuffer: ttsAudioBuffer, mimeType } = await textToSpeech(llmResponse, agent.tts_model);

  // 7. Log to DB
  await db.query(
    `UPDATE voice_sessions SET messages = messages || $1::jsonb WHERE id = $2`,
    [JSON.stringify([
      { role: 'user', content: userText, timestamp: new Date() },
      { role: 'assistant', content: llmResponse, timestamp: new Date() }
    ]), sessionId]
  );

  return { userText, llmResponse, audioResponse: ttsAudioBuffer, audioMimeType: mimeType };
}
