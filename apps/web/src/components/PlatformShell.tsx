'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const links = [
    { href: '/platform', label: 'Overview' },
    { href: '/platform/tenants', label: 'Tenants' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link href="/platform" className="block">
            <h1 className="text-xl font-bold text-purple-400">SPAAS</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Platform Console</p>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || 
              (link.href !== '/platform' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={'block px-4 py-2 rounded-lg text-sm font-medium transition ' + (
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-800'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="mb-3">
            <p className="text-xs text-gray-500">Signed in as</p>
            <p className="text-sm font-medium text-gray-300 truncate">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-purple-900/50 text-purple-300">
              PLATFORM ADMIN
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="text-xs text-center px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:bg-gray-800"
            >
              ? Back to App
            </Link>
            <button
              onClick={logout}
              className="text-xs px-3 py-1.5 rounded bg-red-900/30 text-red-400 hover:bg-red-900/50"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
