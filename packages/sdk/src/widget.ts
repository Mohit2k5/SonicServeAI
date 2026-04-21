import { VaaniAgent } from "./index";

class VaaniWidget extends HTMLElement {
  private agent: VaaniAgent | null = null;
  private isRecording = false;

  connectedCallback() {
    const agentId = this.getAttribute("agent-id");
    const apiKey = this.getAttribute("api-key");

    if (!agentId || !apiKey) return;

    this.agent = new VaaniAgent({
      agentId,
      apiKey,
      onError: (err) => console.error("Vaani Error:", err),
    });

    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        .vaani-btn { 
          width: 60px; height: 60px; border-radius: 50%; 
          background: #000; border: none; cursor: pointer; 
          display: flex; items-center; justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: all 0.2s;
        }
        .vaani-btn:hover { transform: scale(1.05); }
        .vaani-btn svg { width: 24px; height: 24px; fill: white; }
        .vaani-btn.recording { background: #ef4444; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.1) } }
      </style>
      <button class="vaani-btn" id="btn">
        <svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3zm6.5 9a.5.5 0 01.5.5C19 15.09 15.94 18 12 18s-7-2.91-7-6.5a.5.5 0 011 0C6 14.54 8.69 17 12 17s6-2.46 6-5.5a.5.5 0 01.5-.5zM11 20h2v2h-2v-2z"/></svg>
      </button>
    `;

    const btn = shadow.getElementById("btn");
    btn?.addEventListener("click", () => this.toggleRecording());
  }

  async toggleRecording() {
    if (!this.agent) return;
    const btn = this.shadowRoot?.getElementById("btn");

    if (this.isRecording) {
      this.agent.stopRecording();
      this.isRecording = false;
      btn?.classList.remove("recording");
    } else {
      await this.agent.connect();
      await this.agent.startRecording();
      this.isRecording = true;
      btn?.classList.add("recording");
    }
  }
}

if (!customElements.get("vaani-widget")) {
  customElements.define("vaani-widget", VaaniWidget);
}
