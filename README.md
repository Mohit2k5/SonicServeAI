# 🚀 Sonic Serve AI

**Sonic Serve AI** is a high-performance, real-time voice assistant platform designed for the next generation of conversational AI. Built with low-latency in mind, it combines state-of-the-art Speech-to-Text (STT), Large Language Models (LLM), and Text-to-Speech (TTS) to provide a seamless human-like interaction experience.

![Sonic Serve AI Banner](https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=2070&auto=format&fit=crop)

## ✨ Key Features

- **Real-Time Voice Pipeline**: Sub-second latency using WebSocket-based audio streaming.
- **Advanced AI Stack**:
  - **STT**: Deepgram Nova-2 (Industry-leading accuracy).
  - **LLM**: Google gemini-3-flash-preview (Advanced Intelligence with Exceptional Speed).
  - **TTS**: Deepgram Aura (Natural, human-like voice synthesis).
- **Intelligent RAG**: Integrated Retrieval-Augmented Generation using Pinecone for long-term memory and context-aware responses.
- **Enterprise Dashboard**: Manage agents, monitor API usage, and track call analytics in real-time.
- **Self-Healing Infrastructure**: Automated database initialization and robust error recovery.

## 🛠️ Technology Stack

- **Monorepo**: [Turborepo](https://turbo.build/)
- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), Tailwind CSS
- **Backend**: Node.js, Express, WebSocket (ws)
- **Database**: PostgreSQL (pg), Redis
- **Vector DB**: Pinecone
- **Infrastructure**: Docker & Docker Compose
- **Auth**: NextAuth.js

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- Docker Desktop
- API Keys for: Deepgram, Google Gemini, and Pinecone

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/[your-username]/SonicServeAI.git
   cd SonicServeAI
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

   _Fill in your API keys in the `.env` file._

3. **Install Dependencies**:

   ```bash
   npm install
   ```

4. **Start Infrastructure (Docker)**:

   ```bash
   docker-compose up -d
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

- `apps/web`: The Next.js dashboard and landing page.
- `apps/api`: The Node.js server handling the voice pipeline and business logic.
- `packages/shared`: Shared types and utility functions.
- `packages/typescript-config`: Centralized TS configuration.

## 🔒 Security

- Sensitive credentials are managed via environment variables.
- The `.env` file is strictly ignored by Git.
- Database connections are secured within the Docker network.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
