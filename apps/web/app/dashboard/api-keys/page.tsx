'use client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function ApiKeysPage() {
  const { data: session } = useSession();
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const apiKey = (session?.user as any)?.api_key || 'vaan_sk_live_••••••••••••••••••••••••••••••••';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">API Keys</h1>
        <p className="text-sm text-gray-500">Manage keys for accessing the Sonic Serve AI API and SDK</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="font-bold">Secret API Key</h3>
        <p className="text-sm text-gray-500">Keep this key secret and secure. It grants full access to your Sonic Serve AI account.</p>
        
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono text-sm overflow-hidden truncate">
            {reveal ? apiKey : 'vaan_sk_live_••••••••••••••••••••••••••••••••'}
          </div>
          <button 
            onClick={() => setReveal(!reveal)}
            className="px-6 py-4 border border-gray-100 rounded-xl text-sm font-bold hover:bg-gray-50 transition"
          >
            {reveal ? 'Hide' : 'Reveal'}
          </button>
          <button 
            onClick={copyToClipboard}
            className="px-6 py-4 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition shadow-sm min-w-[100px]"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="font-bold">SDK Integration</h3>
        <p className="text-sm text-gray-500">Embed Sonic Serve AI voice into your application using our JavaScript SDK.</p>
        
        <div className="bg-gray-900 rounded-2xl p-6 font-mono text-sm text-gray-300 overflow-x-auto">
          <p className="text-gray-500 mb-4">// Install the SDK</p>
          <p className="mb-6"><span className="text-blue-400">npm</span> install @vaani-ai/sdk</p>
          
          <p className="text-gray-500 mb-4">// Initialize the agent</p>
          <p className="mb-2"><span className="text-blue-400">import</span> {'{'} Sonic Serve AI {'}'} <span className="text-blue-400">from</span> <span className="text-green-400">'@vaani-ai/sdk'</span>;</p>
          <p className="mb-2"><span className="text-blue-400">const</span> agent = <span className="text-blue-400">new</span> <span className="text-yellow-400">Sonic Serve AI</span>({'{'}</p>
          <p className="ml-4">agentId: <span className="text-green-400">'YOUR_AGENT_ID'</span>,</p>
          <p className="ml-4">apiKey: <span className="text-green-400">'{reveal ? apiKey : 'YOUR_API_KEY'}'</span></p>
          <p className="mb-2">{'}'});</p>
          <p><span className="text-blue-400">await</span> agent.<span className="text-yellow-400">connect</span>();</p>
        </div>
      </div>
    </div>
  );
}
