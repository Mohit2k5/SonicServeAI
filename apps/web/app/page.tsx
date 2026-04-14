'use client';
import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold font-grotesk tracking-tight mb-6">
            Give Your Business a <span className="text-gray-400">Voice</span> in Every Language
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 font-inter leading-relaxed">
            AI-powered voice agents supporting 103 Indian languages. 
            Real-time conversations, natural voices, and intelligent responses for your users.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-black text-white rounded-full text-lg font-medium hover:bg-gray-900 transition shadow-lg">
              Start Building Free
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white text-black border border-gray-200 rounded-full text-lg font-medium hover:border-black transition">
              Book Enterprise Demo
            </Link>
          </div>
          
          {/* Waveform visualizer placeholder */}
          <div className="mt-20 flex justify-center items-center gap-1 h-20">
            {mounted && [...Array(40)].map((_, i) => (
              <div 
                key={i} 
                className="w-1 bg-black rounded-full transition-all duration-300 animate-pulse" 
                style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it Works</h2>
            <p className="text-gray-600">The seamless pipeline behind every SONIC SERVE AI interaction.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Voice Input", desc: "User speaks in any of the 103 supported languages." },
              { step: "02", title: "STT Engine", desc: "High-accuracy transcription using our fine-tuned models." },
              { step: "03", title: "AI Core", desc: "Context-aware processing with RAG knowledge base." },
              { step: "04", title: "TTS Output", desc: "Natural voice response with local language nuances." }
            ].map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                <span className="text-6xl font-bold text-gray-50 absolute -right-4 -top-4 group-hover:text-gray-100 transition">{s.step}</span>
                <h3 className="text-xl font-bold mb-3 relative z-10">{s.title}</h3>
                <p className="text-gray-500 text-sm relative z-10">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Enterprise-Ready Features</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              "Multilingual STT", "SONIC SERVE AI LLM", "Natural TTS", 
              "RAG Knowledge Base", "Custom Agents", "Analytics Dashboard",
              "API Access", "Enterprise Security", "103+ Languages"
            ].map((f, i) => (
              <div key={i} className="p-6 border border-gray-100 rounded-xl hover:border-black transition cursor-default">
                <h3 className="font-bold">{f}</h3>
                <p className="text-gray-500 text-sm mt-2">Built for high-performance and scalability at enterprise level.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Agents Section */}
      <section id="custom-agents" className="py-24 px-6 bg-black text-white rounded-3xl mx-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Build, Train, and Deploy in Minutes.</h2>
            <ul className="space-y-4 mb-10 text-gray-400">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-white rounded-full"/>
                Easy SDK integration for web & mobile
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-white rounded-full"/>
                Custom system prompts and agent behavior
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-white rounded-full"/>
                RAG support for proprietary knowledge
              </li>
            </ul>
            <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm border border-gray-800">
              <span className="text-blue-400">const</span> agent = <span className="text-blue-400">new</span> <span className="text-yellow-400">Sonic Serve AIAgent</span>({'{'}
              <br/>&nbsp;&nbsp;agentId: <span className="text-green-400">'vaan_123...'</span>,
              <br/>&nbsp;&nbsp;apiKey: <span className="text-green-400">'key_abc...'</span>
              <br/>{'}'});
              <br/><span className="text-blue-400">await</span> agent.<span className="text-yellow-400">connect</span>();
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-black h-96 rounded-2xl border border-gray-800 flex items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center animate-bounce">
               <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"/>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-10 rounded-3xl border border-gray-100 shadow-sm bg-white">
              <h3 className="text-xl font-bold mb-2">Developer</h3>
              <p className="text-gray-500 mb-6">Perfect for startups and builders.</p>
              <div className="text-4xl font-bold mb-8">$0.02 <span className="text-lg font-normal text-gray-400">/ 1k tokens</span></div>
              <ul className="space-y-4 mb-10">
                <li className="text-sm">✓ All 103 Languages</li>
                <li className="text-sm">✓ Standard RAG support</li>
                <li className="text-sm">✓ Dashboard access</li>
              </ul>
              <Link href="/signup" className="block w-full text-center py-4 border border-black rounded-xl hover:bg-black hover:text-white transition">
                Start Building
              </Link>
            </div>
            <div className="p-10 rounded-3xl bg-black text-white shadow-xl">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <p className="text-gray-400 mb-6">Scale with dedicated support.</p>
              <div className="text-4xl font-bold mb-8">Custom</div>
              <ul className="space-y-4 mb-10">
                <li className="text-sm">✓ Dedicated Infrastructure</li>
                <li className="text-sm">✓ Custom fine-tuned models</li>
                <li className="text-sm">✓ 24/7 Priority Support</li>
              </ul>
              <Link href="/contact" className="block w-full text-center py-4 bg-white text-black rounded-xl hover:bg-gray-100 transition">
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-20 px-6 border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <h2 className="text-xl font-bold mb-6">VAANI</h2>
            <p className="text-gray-500 max-w-sm">
              Empowering businesses to speak their customers' language. 
              The most advanced multilingual voice AI platform in India.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-6">Resources</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link href="/docs">Documentation</Link></li>
              <li><Link href="https://github.com/vaani-ai">GitHub</Link></li>
              <li><Link href="/status">Status</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-6">Legal</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-200 text-sm text-gray-400 text-center">
          © {new Date().getFullYear()} VAANI AI. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
