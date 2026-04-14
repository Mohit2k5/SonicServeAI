import { WebSocketServer, WebSocket } from 'ws';
import { runVoicePipeline } from '../services/voicePipeline';
import { db } from '../db';

export function setupVoiceSocket(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const agentId = url.searchParams.get('agentId');
    const userId = url.searchParams.get('userId');
    let sessionId: string;
    let conversationHistory: any[] = [];

    console.log(`[WS] New connection attempt: Agent=${agentId}, User=${userId}`);

    if (!agentId || !userId || agentId === 'undefined' || userId === 'undefined') {
      console.error(`[WS] Connection rejected: Missing or invalid credentials (Agent: ${agentId}, User: ${userId})`);
      ws.send(JSON.stringify({ type: 'error', message: `Invalid credentials: Agent=${agentId}, User=${userId}` }));
      ws.close();
      return;
    }

    // Create session
    console.log(`[WS] Creating session for Agent=${agentId}, User=${userId}`);
    db.query(
      'INSERT INTO voice_sessions (agent_id, user_id, status) VALUES ($1,$2,$3) RETURNING id',
      [agentId, userId, 'active']
    ).then(({ rows }) => { 
      sessionId = rows[0].id; 
      console.log(`[WS] Session created successfully: ${sessionId}`);
      ws.send(JSON.stringify({ type: 'ready', sessionId }));
    }).catch(err => {
      console.error('[WS] DATABASE ERROR during session creation:', {
        message: err.message,
        detail: err.detail,
        code: err.code,
        where: err.where,
        agentId,
        userId
      });
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: `Database Error: ${err.message}` 
      }));
    });

    ws.on('message', async (data: Buffer) => {
      if (!sessionId) return;
      
      try {
        console.log(`[WS] Processing audio chunk (${data.length} bytes)`);
        ws.send(JSON.stringify({ type: 'processing' }));

        const { userText, llmResponse, audioResponse, audioMimeType } = await runVoicePipeline({
          audioBuffer: data,
          agentId: agentId!,
          sessionId,
          conversationHistory
        });

        console.log(`[WS] Pipeline success: "${userText}" -> "${llmResponse}"`);

        conversationHistory.push({ role: 'user', content: userText });
        conversationHistory.push({ role: 'assistant', content: llmResponse });

        ws.send(JSON.stringify({ type: 'transcript', text: userText }));
        ws.send(JSON.stringify({ type: 'response_text', text: llmResponse }));
        ws.send(JSON.stringify({ type: 'audio_meta', mimeType: audioMimeType }));
        ws.send(audioResponse); // raw audio buffer
        
        ws.send(JSON.stringify({ type: 'done' }));
      } catch (err: any) {
        console.error('[WS] Pipeline error:', err.message);
        ws.send(JSON.stringify({ type: 'error', message: err.message }));
      }
    });

    ws.on('close', () => {
      console.log(`[WS] Connection closed: ${sessionId}`);
      if (sessionId) {
        db.query(
          `UPDATE voice_sessions SET ended_at=NOW(), status='completed',
           duration_seconds = EXTRACT(EPOCH FROM (NOW()-started_at))
           WHERE id=$1`,
          [sessionId]
        ).catch(err => console.error('[WS] failed to update session end:', err));
      }
    });
  });
}
