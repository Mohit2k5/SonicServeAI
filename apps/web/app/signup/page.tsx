'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { apiUrl } from '../../lib/api';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Automatically sign in after signup
        const loginResult = await signIn('credentials', { email, password, redirect: false });
        if (loginResult?.error) {
          setError('Account created, but auto login failed. Please log in.');
          setLoading(false);
          router.push('/login');
          return;
        }
        router.push('/dashboard');
      } else {
        setError(data.error || 'Something went wrong');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
        <Link href="/" className="font-bold text-xl block mb-8">Sonic Serve AI</Link>
        <h1 className="text-2xl font-bold mb-2">Create Account</h1>
        <p className="text-gray-500 text-sm mb-8">Join the voice AI revolution</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition"
            />
          </div>
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account? <Link href="/login" className="text-black font-bold">Log in</Link>
        </p>
      </div>
    </main>
  );
}
