interface VaaniConfig {
  agentId: string;
  apiKey: string;
  language?: string;
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  onAudio?: (audio: ArrayBuffer) => void;
  onError?: (err: Error) => void;
}

export class VaaniAgent {
  private ws: WebSocket | null = null;
  private config: VaaniConfig;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;

  constructor(config: VaaniConfig) {
    this.config = config;
  }

  async connect() {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000"}/voice?agentId=${this.config.agentId}&apiKey=${this.config.apiKey}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "transcript") this.config.onTranscript?.(msg.text);
          if (msg.type === "response_text") this.config.onResponse?.(msg.text);
          if (msg.type === "error")
            this.config.onError?.(new Error(msg.message));
        } catch (e) {
          // If it's not JSON, it might be raw audio handled below
        }
      } else if (
        event.data instanceof Blob ||
        event.data instanceof ArrayBuffer
      ) {
        // Handle raw audio buffer
        this.config.onAudio?.(event.data as ArrayBuffer);
      }
    };

    this.ws.onerror = (err) =>
      this.config.onError?.(new Error("WebSocket error"));

    return new Promise<void>((resolve, reject) => {
      if (!this.ws) return reject(new Error("WS not initialized"));
      this.ws.onopen = () => resolve();
    });
  }

  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(e.data);
        }
      };

      this.mediaRecorder.start(250); // send chunks every 250ms
    } catch (err: any) {
      this.config.onError?.(err);
    }
  }

  stopRecording() {
    this.mediaRecorder?.stop();
    this.stream?.getTracks().forEach((track) => track.stop());
  }

  disconnect() {
    this.ws?.close();
  }
}
