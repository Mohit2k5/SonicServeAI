'use client';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const sidebarLinks = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'My Agents', href: '/dashboard/agents' },
  { label: 'Usage Logs', href: '/dashboard/logs' },
  { label: 'API Keys', href: '/dashboard/api-keys' },
  { label: 'Billing', href: '/dashboard/billing' },
  { label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-8">
          <Link href="/" className="font-bold text-xl tracking-tight">Sonic Serve AI</Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {sidebarLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition ${
                pathname === link.href ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Plan</p>
            <p className="text-sm font-bold capitalize">{(session?.user as any)?.plan || 'Free'}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <h2 className="font-bold text-lg">
            {sidebarLinks.find(l => l.href === pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
              <span className="sr-only">Notifications</span>
              <div className="w-2 h-2 bg-red-500 rounded-full"/>
            </button>
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
              {session.user?.name?.[0] || 'U'}
            </div>
          </div>
        </header>

        <main className="p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
