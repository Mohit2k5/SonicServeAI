"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";

interface VoiceAssistantProps {
  agent: {
    id: string;
    name: string;
    language: string;
  };
  onClose: () => void;
}

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? "";
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ?? "";

// ─── Module-level singleton ───────────────────────────────────────────────────
// Daily.co (used by Vapi) only allows ONE iframe instance in the DOM at a time.
// Keeping the Vapi object at module scope and reusing it prevents the
// "Duplicate DailyIframe instances are not allowed" error.
let vapiSingleton: InstanceType<typeof Vapi> | null = null;

function getVapi(): InstanceType<typeof Vapi> {
  if (!vapiSingleton) {
    vapiSingleton = new Vapi(VAPI_PUBLIC_KEY);
  }
  return vapiSingleton;
}

/** Fully stop the call and remove all listeners. Returns a promise that
 *  resolves after a short delay so Daily.co's iframe has time to unmount. */
async function destroyVapi(): Promise<void> {
  if (!vapiSingleton) return;
  try {
    vapiSingleton.removeAllListeners();
    vapiSingleton.stop();
  } catch {
    /* ignore errors during teardown */
  }
  // Give Daily/WebRTC time to clean up its DOM nodes before we re-init
  await new Promise((r) => setTimeout(r, 400));
}

// Serialize a Vapi error into a human-readable string
function parseVapiError(e: any): string {
  if (!e) return "An unknown Vapi error occurred.";
  if (typeof e === "string") return e;
  const nested = e?.error?.message;
  if (nested && typeof nested === "string") return nested;
  if (e?.message && typeof e.message === "string") return e.message;
  const dumpStr = JSON.stringify(e);
  if (dumpStr && dumpStr !== "{}") return `Vapi error: ${dumpStr}`;
  return "An unknown Vapi error occurred. Check your browser mic permissions.";
}

export function VoiceAssistant({ agent, onClose }: VoiceAssistantProps) {
  const [status, setStatus] = useState<
    "idle" | "connecting" | "listening" | "speaking" | "error"
  >("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const isMountedRef = useRef(true);
  const isEndingRef = useRef(false); // prevent double-stop race

  const initVapi = useCallback(async () => {
    if (!VAPI_PUBLIC_KEY) {
      setError("Vapi public key is missing. Add NEXT_PUBLIC_VAPI_PUBLIC_KEY to your .env file.");
      setStatus("error");
      return;
    }

    if (!VAPI_ASSISTANT_ID) {
      setError(
        "No Vapi assistant configured. Add NEXT_PUBLIC_VAPI_ASSISTANT_ID to your .env file. Create one at dashboard.vapi.ai.",
      );
      setStatus("error");
      return;
    }

    // ── Tear down any previous session, wait for Daily iframe to unmount ──
    await destroyVapi();
    if (!isMountedRef.current) return;

    setStatus("connecting");
    setError("");
    isEndingRef.current = false;

    // ── Microphone check ─────────────────────────────────────────────────
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch (micErr: any) {
      if (!isMountedRef.current) return;
      const name = micErr?.name ?? "";
      const msg =
        name === "NotAllowedError"
          ? "Microphone access denied. Allow mic access in your browser, then retry."
          : name === "NotFoundError"
            ? "No microphone detected on this device."
            : `Microphone error (${name}): ${micErr?.message ?? "unknown"}`;
      setError(msg);
      setStatus("error");
      return;
    }

    // ── Wire up events on the singleton ──────────────────────────────────
    const vapi = getVapi();

    vapi.on("call-start", () => {
      if (!isMountedRef.current) return;
      setStatus("listening");
      setError("");
    });

    vapi.on("call-end", () => {
      if (!isMountedRef.current) return;
      setStatus("idle");
      // Auto-close the modal after the call ends naturally
      if (!isEndingRef.current) {
        isEndingRef.current = true;
        onClose();
      }
    });

    vapi.on("speech-start", () => {
      if (!isMountedRef.current) return;
      setStatus("speaking");
    });

    vapi.on("speech-end", () => {
      if (!isMountedRef.current) return;
      setStatus("listening");
    });

    vapi.on("message", (message: Record<string, unknown>) => {
      if (!isMountedRef.current) return;
      if (message.type === "transcript" && message.transcriptType === "final") {
        if (message.role === "user") setTranscript(message.transcript as string);
        else if (message.role === "assistant") setResponse(message.transcript as string);
      }
    });

    vapi.on("volume-level", (vol: number) => {
      if (isMountedRef.current) setVolumeLevel(vol);
    });

    vapi.on("error", (e: any) => {
      if (!isMountedRef.current) return;
      const msg = parseVapiError(e);
      console.error("[Vapi] Error event →", { type: e?.type, stage: e?.stage, message: msg });

      let userMsg = msg;
      if (msg.toLowerCase().includes("duplicate")) {
        userMsg = "Previous session still closing — please wait a moment and click Retry.";
      } else if (
        msg.toLowerCase().includes("doesn't allow assistantid") ||
        msg.toLowerCase().includes("doesn't allow transient")
      ) {
        userMsg =
          "⚠️ Vapi key mismatch: your public key does not own this assistant. Go to dashboard.vapi.ai → API Keys, copy the PUBLIC key from the same account, and update NEXT_PUBLIC_VAPI_PUBLIC_KEY in your .env.";
      } else if (
        msg.toLowerCase().includes("network") ||
        msg.toLowerCase().includes("fetch")
      ) {
        userMsg = "Connection failed. Disable ad-blockers for localhost and retry.";
      }
      setError(userMsg);
      setStatus("error");
    });

    // ── Start the call ────────────────────────────────────────────────────
    try {
      console.log("[Vapi] Starting with assistant ID:", VAPI_ASSISTANT_ID);
      await vapi.start(VAPI_ASSISTANT_ID);
    } catch (startErr: any) {
      if (!isMountedRef.current) return;
      const msg = startErr?.message ?? "Failed to start Vapi session.";
      console.error("[Vapi] vapi.start() threw:", startErr);
      setError(msg);
      setStatus("error");
    }
  }, [agent.name, agent.language, retryCount, onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    isMountedRef.current = true;
    initVapi();
    return () => {
      isMountedRef.current = false;
      // Do NOT destroy singleton here — just remove listeners.
      // Full destruction happens at the top of the next initVapi() call.
      if (vapiSingleton) {
        vapiSingleton.removeAllListeners();
      }
    };
  }, [initVapi]);

  const handleEndCall = useCallback(async () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    // Stop the active call first, then close the modal
    if (vapiSingleton) {
      try {
        vapiSingleton.stop();
      } catch {
        /* ignore */
      }
    }
    // Brief wait so the call-end event fires and Daily cleans up
    await new Promise((r) => setTimeout(r, 300));
    onClose();
  }, [onClose]);

  const handleRetry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  const isLive = status === "listening" || status === "speaking";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[70vh] sm:h-auto border border-white/20">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                {agent.language === "hi" ? "🇮🇳" : "🌐"}
              </div>
              {status === "speaking" && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                  <span className="text-[10px] text-white">🔊</span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-black">
                {agent.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    status === "listening"
                      ? "bg-green-500 animate-pulse"
                      : status === "speaking"
                        ? "bg-blue-500 animate-pulse"
                        : status === "error"
                          ? "bg-red-500"
                          : status === "connecting"
                            ? "bg-yellow-400 animate-pulse"
                            : "bg-gray-300"
                  }`}
                />
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  {status}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleEndCall}
            aria-label="Close"
            className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center transition text-gray-300 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Conversation */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6 min-h-[300px]">
          {transcript && (
            <div className="flex justify-end animate-in slide-in-from-right-4 duration-300">
              <div className="bg-black text-white px-6 py-4 rounded-3xl rounded-tr-none max-w-[85%] shadow-xl">
                <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-tighter">
                  You
                </p>
                <p className="text-sm leading-relaxed">{transcript}</p>
              </div>
            </div>
          )}
          {response && (
            <div className="flex justify-start animate-in slide-in-from-left-4 duration-300">
              <div className="bg-gray-100 px-6 py-4 rounded-3xl rounded-tl-none max-w-[85%] border border-gray-200 shadow-sm">
                <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-tighter">
                  {agent.name}
                </p>
                <p className="text-sm leading-relaxed text-gray-800 font-medium">
                  {response}
                </p>
              </div>
            </div>
          )}
          {!transcript && !response && (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 px-10">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 relative">
                {status !== "error" && (
                  <div className="absolute inset-0 bg-black/5 rounded-full animate-ping opacity-20" />
                )}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${status === "error" ? "bg-red-500" : "bg-black"}`}
                >
                  <div
                    className={`w-3 h-3 bg-white rounded-full ${isLive ? "animate-pulse" : ""}`}
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">
                {status === "connecting"
                  ? "Connecting…"
                  : status === "listening"
                    ? "I'm Listening…"
                    : status === "speaking"
                      ? `${agent.name} is Speaking`
                      : status === "error"
                        ? "Connection Error"
                        : "Ready"}
              </h3>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                {status === "connecting"
                  ? "Establishing a secure voice connection…"
                  : status === "error"
                    ? error
                    : `Speak freely — I'll respond in ${agent.language === "hi" ? "Hindi" : "English"}`}
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
                  const v = Math.max(
                    0.05,
                    volumeLevel + Math.sin(i * 0.7 + Date.now() * 0.008) * 0.1,
                  );
                  height = Math.min(100, Math.max(10, v * 100));
                }
                return (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-75 ${
                      status === "listening"
                        ? "bg-black"
                        : status === "speaking"
                          ? "bg-blue-500"
                          : "bg-gray-200"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>

            <div className="w-full flex justify-center gap-3">
              {status === "error" ? (
                <>
                  <button
                    onClick={handleRetry}
                    className="px-8 py-4 rounded-2xl font-bold text-sm bg-black text-white hover:bg-gray-900 transition-all shadow-lg"
                  >
                    Retry
                  </button>
                  <button
                    onClick={onClose}
                    className="px-8 py-4 rounded-2xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    Close
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEndCall}
                  className={`w-full max-w-sm py-5 rounded-2xl font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-3 ${
                    isLive
                      ? "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]"
                      : "bg-black text-white hover:bg-gray-900"
                  }`}
                >
                  {isLive ? (
                    <>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      End Call
                    </>
                  ) : (
                    "Close"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
