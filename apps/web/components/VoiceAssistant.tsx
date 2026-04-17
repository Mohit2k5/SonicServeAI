'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

interface VoiceAssistantProps {
  agent: {
    id: string;
    name: string;
    language: string;
  };
  onClose: () => void;
}

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? '';
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ?? '';

// Serialize a Vapi error (class instance) into a readable plain object
function parseVapiError(e: any): string {
  if (!e) return 'An unknown Vapi error occurred.';
  if (typeof e === 'string') return e;

  // Try the nested .error.message that Vapi's SDK emits
  const nested = e?.error?.message;
  if (nested && typeof nested === 'string') return nested;

  // Direct message property
  if (e?.message && typeof e.message === 'string') return e.message;

  // Fallback: enumerate ALL own + prototype keys
  const dump: Record<string, unknown> = {};
  try {
    const proto = Object.getPrototypeOf(e) ?? {};
    const keys = [...Object.getOwnPropertyNames(e), ...Object.getOwnPropertyNames(proto)];
    for (const k of keys) {
      if (k === 'constructor') continue;
      try { dump[k] = (e as any)[k]; } catch { /* skip getters that throw */ }
    }
  } catch { /* ignore */ }

  const dumpStr = JSON.stringify(dump);
  if (dumpStr && dumpStr !== '{}') return `Vapi error: ${dumpStr}`;

  return 'An unknown Vapi error occurred. Check your browser mic permissions and disable any ad-blockers.';
}

export function VoiceAssistant({ agent, onClose }: VoiceAssistantProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'error'>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const vapiRef = useRef<InstanceType<typeof Vapi> | null>(null);
  const isMountedRef = useRef(true);

  const initVapi = useCallback(async () => {
    if (!VAPI_PUBLIC_KEY) {
      setError('NEXT_PUBLIC_VAPI_PUBLIC_KEY is missing from your .env.local file.');
      setStatus('error');
      return;
    }

    // Tear down previous instance
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current.removeAllListeners();
      vapiRef.current = null;
    }

    setStatus('connecting');
    setError('');

    // ── Step 1: Check microphone access ────────────────────────────────────
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop()); // release immediately
    } catch (micErr: any) {
      if (!isMountedRef.current) return;
      const name = micErr?.name ?? '';
      const msg =
        name === 'NotAllowedError'
          ? 'Microphone access denied. Click the camera icon in your browser address bar and allow microphone access, then retry.'
          : name === 'NotFoundError'
          ? 'No microphone detected on this device.'
          : `Microphone error (${name}): ${micErr?.message ?? 'unknown'}`;
      console.error('[Vapi] Mic error:', micErr);
      setError(msg);
      setStatus('error');
      return;
    }

    // ── Step 2: Check if WebRTC is reachable (Daily.co firewall test) ──────
    try {
      const probe = await fetch('https://api.vapi.ai/call/web', {
        method: 'OPTIONS',
        mode: 'cors',
      }).catch(() => null);
      // Any response (even non-2xx) means the network path is clear.
      // A null means the fetch itself failed → firewall / ad-blocker.
      if (!probe) throw new Error('Network probe failed');
    } catch {
      // Non-fatal: just log. Some browsers block OPTIONS preflight anyway.
      console.warn('[Vapi] Preflight probe failed — possible ad-blocker or firewall.');
    }

    // ── Step 3: Initialise and start Vapi ──────────────────────────────────
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      if (!isMountedRef.current) return;
      setStatus('listening');
      setError('');
    });

    vapi.on('call-end', () => {
      if (!isMountedRef.current) return;
      setStatus('idle');
    });

    vapi.on('speech-start', () => {
      if (!isMountedRef.current) return;
      setStatus('speaking');
    });

    vapi.on('speech-end', () => {
      if (!isMountedRef.current) return;
      setStatus('listening');
    });

    vapi.on('message', (message: Record<string, unknown>) => {
      if (!isMountedRef.current) return;
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        if (message.role === 'user') setTranscript(message.transcript as string);
        else if (message.role === 'assistant') setResponse(message.transcript as string);
      }
    });

    vapi.on('volume-level', (vol: number) => {
      if (isMountedRef.current) setVolumeLevel(vol);
    });

    vapi.on('error', (e: any) => {
      if (!isMountedRef.current) return;
      const msg = parseVapiError(e);
      // Log every known Vapi field for debugging
      console.error('[Vapi] Error event →', {
        type: e?.type,
        stage: e?.stage,
        message: msg,
        context: e?.context,
        errorObj: e?.error,
      });
      // Helpful hint for the most common cause
      const userMsg =
        msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')
          ? 'Connection failed. Please disable any ad-blockers for localhost and try again. (Daily.co WebRTC blocked)'
          : msg;
      setError(userMsg);
      setStatus('error');
    });

    // ── Step 4: Start the call ─────────────────────────────────────────────
    try {
      if (VAPI_ASSISTANT_ID) {
        console.log('[Vapi] Starting with Assistant ID:', VAPI_ASSISTANT_ID);
        await vapi.start(VAPI_ASSISTANT_ID);
      } else {
        console.warn('[Vapi] No VAPI_ASSISTANT_ID — using inline transient config.');
        await vapi.start({
          name: agent.name,
          firstMessage: `Hello! I am ${agent.name}. How can I assist you today?`,
          transcriber: { provider: 'deepgram', model: 'nova-2', language: agent.language === 'hi' ? 'hi' : 'en-US' } as any,
          model: {
            provider: 'openai',
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: `You are ${agent.name}. Reply in ${agent.language}. Be concise.` }],
          } as any,
          voice: { provider: 'playht', voiceId: 'jennifer' } as any,
        });
      }
    } catch (startErr: any) {
      if (!isMountedRef.current) return;
      const msg = startErr?.message ?? 'Failed to start Vapi session.';
      console.error('[Vapi] vapi.start() threw:', startErr);
      setError(msg);
      setStatus('error');
    }
  }, [agent.name, agent.language, retryCount]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    isMountedRef.current = true;
    initVapi();
    return () => {
      isMountedRef.current = false;
      if (vapiRef.current) {
        vapiRef.current.stop();
        vapiRef.current.removeAllListeners();
        vapiRef.current = null;
      }
    };
  }, [initVapi]);

  const handleEndCall = () => {
    vapiRef.current?.stop();
    onClose();
  };

  const handleRetry = () => {
    setRetryCount(c => c + 1); // triggers useEffect → initVapi
  };

  const isLive = status === 'listening' || status === 'speaking';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[70vh] sm:h-auto border border-white/20">

        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                {agent.language === 'hi' ? '🇮🇳' : '🌐'}
              </div>
              {status === 'speaking' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                  <span className="text-[10px] text-white">🔊</span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-black">{agent.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`w-2 h-2 rounded-full transition-colors ${
                  status === 'listening'  ? 'bg-green-500 animate-pulse' :
                  status === 'speaking'   ? 'bg-blue-500 animate-pulse'  :
                  status === 'error'      ? 'bg-red-500'                 :
                  status === 'connecting' ? 'bg-yellow-400 animate-pulse': 'bg-gray-300'
                }`} />
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{status}</p>
              </div>
            </div>
          </div>
          <button onClick={handleEndCall} aria-label="Close" className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center transition text-gray-300 hover:text-black">
            ✕
          </button>
        </div>

        {/* Conversation */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6 min-h-[300px]">
          {transcript && (
            <div className="flex justify-end animate-in slide-in-from-right-4 duration-300">
              <div className="bg-black text-white px-6 py-4 rounded-3xl rounded-tr-none max-w-[85%] shadow-xl">
                <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-tighter">You</p>
                <p className="text-sm leading-relaxed">{transcript}</p>
              </div>
            </div>
          )}
          {response && (
            <div className="flex justify-start animate-in slide-in-from-left-4 duration-300">
              <div className="bg-gray-100 px-6 py-4 rounded-3xl rounded-tl-none max-w-[85%] border border-gray-200 shadow-sm">
                <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-tighter">{agent.name}</p>
                <p className="text-sm leading-relaxed text-gray-800 font-medium">{response}</p>
              </div>
            </div>
          )}
          {!transcript && !response && (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 px-10">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 relative">
                {status !== 'error' && <div className="absolute inset-0 bg-black/5 rounded-full animate-ping opacity-20" />}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${status === 'error' ? 'bg-red-500' : 'bg-black'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full ${isLive ? 'animate-pulse' : ''}`} />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">
                {status === 'connecting' ? 'Connecting…'      :
                 status === 'listening'  ? 'I\'m Listening…'  :
                 status === 'speaking'   ? `${agent.name} is Speaking` :
                 status === 'error'      ? 'Connection Error' : 'Ready'}
              </h3>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                {status === 'connecting' ? 'Establishing a secure voice connection…' :
                 status === 'error'      ? error :
                 `Speak freely — I'll respond in ${agent.language === 'hi' ? 'Hindi' : 'English'}`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50/50 border-t border-gray-100">
          <div className="flex flex-col items-center gap-6">
            {/* Waveform */}
            <div className="flex items-end justify-center gap-1.5 h-14 w-full max-w-md mx-auto">
              {[...Array(32)].map((_, i) => {
                let height = 10;
                if (isLive) {
                  const v = Math.max(0.05, volumeLevel + Math.sin(i * 0.7 + Date.now() * 0.008) * 0.1);
                  height = Math.min(100, Math.max(10, v * 100));
                }
                return (
                  <div key={i} className={`w-1.5 rounded-full transition-all duration-75 ${
                    status === 'listening' ? 'bg-black' :
                    status === 'speaking'  ? 'bg-blue-500' : 'bg-gray-200'
                  }`} style={{ height: `${height}%` }} />
                );
              })}
            </div>

            <div className="w-full flex justify-center gap-3">
              {status === 'error' ? (
                <>
                  <button onClick={handleRetry} className="px-8 py-4 rounded-2xl font-bold text-sm bg-black text-white hover:bg-gray-900 transition-all shadow-lg">
                    Retry
                  </button>
                  <button onClick={onClose} className="px-8 py-4 rounded-2xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
                    Close
                  </button>
                </>
              ) : (
                <button onClick={handleEndCall} className={`w-full max-w-sm py-5 rounded-2xl font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-3 ${
                  isLive ? 'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]' : 'bg-black text-white hover:bg-gray-900'
                }`}>
                  {isLive ? <><div className="w-2 h-2 bg-white rounded-full animate-pulse" />End Call</> : 'Close'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
