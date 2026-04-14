'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { VoiceAssistant } from '../../../components/VoiceAssistant';
import { apiUrl } from '../../../lib/api';

interface Agent {
  id: string;
  name: string;
  language: string;
  is_active: boolean;
  created_at: string;
}

export default function AgentsPage() {
  const { data: session } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('hi');
  const [prompt, setPrompt] = useState('');

  const fetchAgents = async () => {
    if (!session?.accessToken) return;
    try {
      const res = await fetch(apiUrl('/api/agents'), {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      });
      const data = await res.json();
      setAgents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [session]);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl('/api/agents'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}` 
        },
        body: JSON.stringify({ name, language, system_prompt: prompt })
      });
      if (res.ok) {
        setShowModal(false);
        setName('');
        setPrompt('');
        fetchAgents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading agents...</div>;

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Agents</h1>
          <p className="text-sm text-gray-500">Manage your multilingual voice assistants</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-900 transition shadow-sm"
        >
          + Create New Agent
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div 
            key={agent.id} 
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-black transition group cursor-pointer flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl">
                {agent.language === 'hi' ? '🇮🇳' : '🌐'}
              </div>
              <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${agent.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {agent.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold mb-1">{agent.name}</h3>
              <p className="text-xs text-gray-400 mb-4">Language: {agent.language === 'hi' ? 'Hindi' : agent.language}</p>
            </div>

            <div className="pt-4 mt-auto border-t border-gray-50 flex items-center justify-between">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAgent(agent);
                }}
                className="bg-gray-50 hover:bg-black hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2"
              >
                Launch Session ↗
              </button>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button className="text-[10px] font-bold text-gray-400 hover:text-black">Edit</button>
              </div>
            </div>
          </div>
        ))}
        {agents.length === 0 && (
          <div className="col-span-3 py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">No agents found. Create your first one to get started!</p>
          </div>
        )}
      </div>

      {/* Voice Assistant Session */}
      {selectedAgent && (
        <VoiceAssistant 
          agent={selectedAgent} 
          onClose={() => setSelectedAgent(null)} 
        />
      )}

      {/* Create Agent Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-lg rounded-3xl p-10 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-2">New Voice Agent</h2>
            <p className="text-gray-500 text-sm mb-8">Configure your agent's personality and language.</p>
            
            <form onSubmit={handleCreateAgent} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Agent Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Customer Support"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Primary Language</label>
                <select 
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition appearance-none"
                >
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="en">English</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="mr">Marathi (మరాठी)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">System Prompt</label>
                <textarea 
                  placeholder="Describe your agent's role and personality..."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-4 border border-gray-100 rounded-xl text-sm font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition shadow-lg"
                >
                  Create Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
