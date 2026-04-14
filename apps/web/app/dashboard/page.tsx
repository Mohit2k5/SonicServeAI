'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { apiUrl } from '../../lib/api';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ totalSessions: 0, totalTokens: 0, activeAgents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      fetch(apiUrl('/api/dashboard/stats'), {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      })
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(console.error);
    } else {
      setLoading(false);
    }
  }, [session]);

  if (loading) return <div>Loading stats...</div>;

  const statCards = [
    { label: 'Total Sessions', value: stats.totalSessions, change: '+12% from last month' },
    { label: 'Tokens Used', value: stats.totalTokens.toLocaleString(), change: '+5% from last month' },
    { label: 'Active Agents', value: stats.activeAgents, change: 'Running stable' },
    { label: 'This Month Cost', value: `$${(stats.totalTokens * 0.00002).toFixed(2)}`, change: 'Current plan: Developer' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-4 gap-6">
        {statCards.map(card => (
          <div key={card.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
            <p className="text-3xl font-bold mb-2">{card.value}</p>
            <p className="text-xs text-gray-500 font-medium">{card.change}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Voice Session #{1002 - i}</p>
                    <p className="text-xs text-gray-400">Agent: Customer Support (Hindi)</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-400">2 mins ago</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition text-left group">
              <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition">+</div>
              <p className="text-sm font-bold">New Agent</p>
              <p className="text-xs text-gray-400">Deploy in seconds</p>
            </button>
            <button className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition text-left group">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition">?</div>
              <p className="text-sm font-bold">Docs</p>
              <p className="text-xs text-gray-400">View API guide</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
