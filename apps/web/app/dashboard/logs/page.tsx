'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { apiUrl } from '../../../lib/api';

interface LogEntry {
  id: string;
  started_at: string;
  agent_name?: string;
  duration_seconds?: number;
  status: string;
}

export default function LogsPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      // Assuming we have an endpoint for all logs or logs per agent
      // For now, let's fetch a list of sessions
      fetch(apiUrl('/api/agents/all/logs'), {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      })
      .then(r => r.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  if (loading) return <div>Loading logs...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Usage Logs</h1>
        <p className="text-sm text-gray-500">Track and analyze every voice interaction</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/50">
              <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
              <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Agent</th>
              <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Duration</th>
              <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.length > 0 ? logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition cursor-pointer">
                <td className="px-8 py-4 text-sm font-medium">{new Date(log.started_at).toLocaleString()}</td>
                <td className="px-8 py-4 text-sm">{log.agent_name || 'Voice Agent'}</td>
                <td className="px-8 py-4 text-sm">{log.duration_seconds || 0}s</td>
                <td className="px-8 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    log.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-8 py-4 text-sm text-gray-400 font-bold hover:text-black transition">View Transcript</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-gray-400 text-sm italic">
                  No session logs found yet. Start using your agents to see activity here!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
