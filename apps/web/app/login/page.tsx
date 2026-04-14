'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) {
      setError('Invalid credentials');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
        <Link href="/" className="font-bold text-xl block mb-8">Sonic Serve AI</Link>
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-8">Sign in to your Sonic Serve AI account</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition"
            />
          </div>
          
          {error && <p className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="bg-black text-white rounded-xl py-4 text-sm font-bold hover:bg-gray-900 transition mt-2 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-8">
          Don't have an account? <Link href="/signup" className="text-black font-bold">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
