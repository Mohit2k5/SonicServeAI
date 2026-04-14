'use client';
import { Header } from '../../components/Header';
import Link from 'next/link';

export default function DocsPage() {
  const sections = [
    { id: 'quickstart', title: 'Quickstart' },
    { id: 'api', title: 'REST API' },
    { id: 'websocket', title: 'WebSocket Protocol' },
    { id: 'sdk', title: 'SDK Reference' },
    { id: 'languages', title: 'Supported Languages' },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-12 flex gap-12">
        {/* Sidebar */}
        <aside className="w-64 hidden lg:block sticky top-32 h-fit">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Documentation</p>
          <nav className="space-y-1">
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition">
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 max-w-3xl space-y-24 pb-32">
          {/* Quickstart */}
          <section id="quickstart">
            <h1 className="text-4xl font-bold mb-6">Quickstart</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Get started with VAANI AI in minutes. Follow these steps to embed a multilingual voice assistant into your application.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="font-bold mb-1">Create an Agent</h3>
                  <p className="text-sm text-gray-500">Go to your <Link href="/dashboard/agents" className="text-black underline">Dashboard</Link> and create a new voice agent. Choose your primary language and set a system prompt.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-bold mb-1">Get your API Key</h3>
                  <p className="text-sm text-gray-500">Copy your secret API key from the <Link href="/dashboard/api-keys" className="text-black underline">API Keys</Link> section.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-bold mb-1">Embed the SDK</h3>
                  <p className="text-sm text-gray-500 mb-4">Install the package and initialize your agent.</p>
                  <pre className="bg-gray-50 p-4 rounded-xl text-xs font-mono text-gray-600">npm install @vaani-ai/sdk</pre>
                </div>
              </div>
            </div>
          </section>

          {/* API */}
          <section id="api" className="pt-12 border-t border-gray-100">
            <h2 className="text-3xl font-bold mb-6">REST API</h2>
            <p className="text-gray-500 mb-8">Direct access to the VAANI engine for custom integrations.</p>
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-green-50 text-green-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">POST</span>
                  <code className="text-sm font-bold">/api/agents</code>
                </div>
                <p className="text-sm text-gray-500 mb-4">Create a new voice agent.</p>
                <pre className="bg-gray-50 p-4 rounded-xl text-xs font-mono text-gray-600">
                  {`{
  "name": "Customer Support",
  "language": "hi",
  "system_prompt": "You are a helpful assistant..."
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* WebSocket */}
          <section id="websocket" className="pt-12 border-t border-gray-100">
            <h2 className="text-3xl font-bold mb-6">WebSocket Protocol</h2>
            <p className="text-gray-500 mb-8">Real-time voice streaming protocol using raw audio buffers.</p>
            <div className="bg-black text-white p-6 rounded-2xl font-mono text-xs">
              <p className="text-gray-500"># Connect to the voice stream</p>
              <p>wss://api.vaani.ai/voice?agentId=AGENT_ID&apiKey=API_KEY</p>
            </div>
          </section>
          
          {/* Languages */}
          <section id="languages" className="pt-12 border-t border-gray-100">
            <h2 className="text-3xl font-bold mb-6">Supported Languages</h2>
            <p className="text-gray-500 mb-8">VAANI supports 103 Indian languages and dialects.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu', 'Gujarati', 'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese'].map(l => (
                <div key={l} className="p-3 bg-gray-50 rounded-xl text-xs font-bold text-center border border-gray-100">{l}</div>
              ))}
              <div className="p-3 bg-gray-50 rounded-xl text-xs font-bold text-center border border-gray-100 opacity-50">+91 More</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
