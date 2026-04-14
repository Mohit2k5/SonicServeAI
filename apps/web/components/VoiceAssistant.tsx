'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface VoiceAssistantProps {
  agent: {
    id: string;
    name: string;
    language: string;
  };
  onClose: () => void;
}

export function VoiceAssistant({ agent, onClose }: VoiceAssistantProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioMimeRef = useRef('audio/mpeg');

  useEffect(() => {
    let isMounted = true;
    
    const connect = () => {
      setStatus('connecting');
      const userId = (session?.user as any)?.id;
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?agentId=${agent.id}&userId=${userId}`;
      
      console.log('[DEBUG] Connecting to WebSocket:', { url: wsUrl, userId });

      if (!userId) {
        setError('User ID missing. Try logging out.');
        setStatus('error');
        return;
      }

      const socket = new WebSocket(wsUrl);
      socket.binaryType = 'arraybuffer';
      socketRef.current = socket;

      socket.onopen = () => {
        if (!isMounted) {
          socket.close();
          return;
        }
        console.log('[DEBUG] WebSocket Established');
      };

      socket.onmessage = async (event) => {
        if (!isMounted) return;
        
        if (typeof event.data === 'string') {
          const msg = JSON.parse(event.data);
          if (msg.type === 'ready') {
            console.log('[DEBUG] Server Ready');
            setStatus('listening');
            startRecording();
          }
          if (msg.type === 'processing') setStatus('processing');
          if (msg.type === 'transcript') setTranscript(msg.text);
          if (msg.type === 'response_text') setResponse(msg.text);
          if (msg.type === 'audio_meta' && typeof msg.mimeType === 'string') {
            audioMimeRef.current = msg.mimeType;
          }
          if (msg.type === 'error') {
            setError(msg.message);
            setStatus('error');
            console.error('[DEBUG] Server reported error:', msg.message);
          }
          if (msg.type === 'done' && status !== 'speaking') {
            setStatus('listening');
            startRecording();
          }
        } else {
          setStatus('speaking');
          playAudio(event.data).catch((err) => {
            console.error('[DEBUG] Audio playback failed:', err);
            setError('Audio playback failed. Check TTS output format.');
            setStatus('listening');
            startRecording();
          });
        }
      };

      socket.onerror = () => {
        if (!isMounted) return;
        console.warn('[DEBUG] WebSocket interrupted or failed');
      };

      socket.onclose = () => {
        if (isMounted) {
          console.log('[DEBUG] WebSocket Closed');
          if (status !== 'error') setStatus('idle');
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      socketRef.current?.close();
      stopRecording();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [session, agent.id]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      drawWaveform();

      // --- SILENCE DETECTION (Efficiency Optimization) ---
      let silenceStart = Date.now();
      const SILENCE_THRESHOLD = 15; // Volume threshold
      const SILENCE_DURATION = 2000; // 2 seconds of silence to auto-stop

      const checkSilence = () => {
        if (status !== 'listening') return;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

        if (average < SILENCE_THRESHOLD) {
          if (Date.now() - silenceStart > SILENCE_DURATION) {
            console.log('[DEBUG] Silence detected, auto-stopping...');
            handleManualAction();
            return;
          }
        } else {
          silenceStart = Date.now();
        }
        requestAnimationFrame(checkSilence);
      };
      requestAnimationFrame(checkSilence);
      // ----------------------------------------------------

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(audioBlob);
          console.log('[DEBUG] Audio sent to server');
        }
      };

      mediaRecorder.start();
      console.log('[DEBUG] Recording started');
    } catch (err) {
      console.error('Mic error:', err);
      setStatus('error');
      setError('Check microphone permissions');
    }
  };

  const drawWaveform = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const update = () => {
      if (!analyser) return;
      analyser.getByteFrequencyData(dataArray);
      
      const bars = document.querySelectorAll('.wave-bar');
      bars.forEach((bar, i) => {
        const value = dataArray[i % bufferLength] || 0;
        const height = Math.max(10, (value / 255) * 100);
        (bar as HTMLElement).style.height = `${height}%`;
      });

      animationFrameRef.current = requestAnimationFrame(update);
    };
    update();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const playAudio = async (data: BlobPart) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context after user gesture
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const arrayBuffer = await new Response(data).arrayBuffer();
    try {
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        if (status === 'speaking') {
          setStatus('listening');
          startRecording();
        }
      };
      source.start();
      console.log('[DEBUG] Audio playing via AudioContext');
    } catch (err) {
      console.warn('[DEBUG] AudioContext decode failed, falling back to HTML5 Audio', err);
      const blob = new Blob([arrayBuffer], { type: audioMimeRef.current || 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (status === 'speaking') {
          setStatus('listening');
          startRecording();
        }
      };
      await audio.play();
    }
  };

  const handleManualAction = async () => {
    // Explicitly resume audio context on first click to satisfy browser policies
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (status === 'listening') {
      stopRecording();
      setStatus('processing');
    }
  };


  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[70vh] sm:h-auto border border-white/20">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner text-black">
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
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === 'listening' ? 'bg-green-500 animate-pulse' : status === 'speaking' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}/>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{status}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center transition text-gray-300 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6 scrollbar-hide min-h-[300px]">
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
            <div className="h-full flex flex-col items-center justify-center text-center py-20 px-10">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-black/5 rounded-full animate-ping opacity-20"/>
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
                  <div className={`w-2 h-2 bg-white rounded-full ${status === 'listening' || status === 'speaking' ? 'animate-pulse' : ''}`}/>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">
                {status === 'connecting' ? 'Connecting...' : 
                 status === 'listening' ? 'I\'m Listening...' : 
                 status === 'speaking' ? `${agent.name} is Speaking` :
                 status === 'processing' ? 'Thinking...' : 'Ready'}
              </h3>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                {status === 'connecting' ? 'Establishing secure connection...' : 
                 `I will respond both in voice and text in ${agent.language === 'hi' ? 'Hindi' : 'English'}`}
              </p>
            </div>
          )}
        </div>

        {/* Footer / Controls */}
        <div className="p-10 bg-gray-50/50 border-t border-gray-100">
          <div className="flex flex-col items-center gap-8">
            {/* Real-time Waveform */}
            <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-md mx-auto">
              {[...Array(32)].map((_, i) => (
                <div 
                  key={i} 
                  className={`wave-bar w-1.5 rounded-full transition-all duration-75 ${status === 'listening' ? 'bg-black' : status === 'speaking' ? 'bg-blue-500' : 'bg-gray-200'}`}
                  style={{ height: '10%' }}
                />
              ))}
            </div>

            <div className="w-full flex justify-center">
              <button 
                onClick={handleManualAction}
                disabled={status !== 'listening' && status !== 'speaking'}
                className={`w-full max-w-sm py-5 rounded-2xl font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-3
                  ${status === 'listening' 
                    ? 'bg-black text-white hover:bg-gray-900 active:scale-[0.98] cursor-pointer' 
                    : status === 'speaking'
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed uppercase'}
                `}
              >
                {status === 'listening' ? (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
                    Stop Recording
                  </>
                ) : status === 'speaking' ? (
                  <>
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"/>
                    Speaking...
                  </>
                ) : (
                  <>{status}...</>
                )}
              </button>
            </div>
            
            {error && (
              <div className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border border-red-100">
                <span>⚠️</span> {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

