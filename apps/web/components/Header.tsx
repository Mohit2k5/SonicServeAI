'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const navLinks = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Custom Agents', href: '/#custom-agents' },
  { label: 'Docs', href: '/docs' },
  { label: 'Enterprise', href: '/enterprise' }
];

export function Header() {
  const { data: session } = useSession();
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight">Sonic Serve AI</Link>
        <nav className="hidden md:flex gap-6 text-sm text-gray-600">
          {navLinks.map(l => <Link key={l.href} href={l.href} className="hover:text-black transition">{l.label}</Link>)}
        </nav>
        <div className="flex gap-3">
          {session ? (
            <Link href="/dashboard" className="px-4 py-2 bg-black text-white rounded-lg text-sm">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm text-gray-700 hover:text-black">Login</Link>
              <Link href="/signup" className="px-4 py-2 bg-black text-white rounded-lg text-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
