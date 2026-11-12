'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const links = [
    { href: '/platform', label: 'Overview' },
    { href: '/platform/tenants', label: 'Tenants' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-spaas-navy text-gray-900 dark:text-white flex transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-black/20 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/platform" className="block">
            <Logo variant="full" href={null} height={28} />
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-2 ml-1">
              Platform Console
            </p>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/platform' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  'block px-4 py-2 rounded-lg text-sm font-medium transition ' +
                  (isActive
                    ? 'bg-spaas-blue/10 text-spaas-blue dark:text-white border border-spaas-blue/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white')
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="mb-3">
            <p className="text-xs text-gray-500">Signed in as</p>
            <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
              {user?.email}
            </p>
            {/* FIXED PURPLE BADGE TO BLUE */}
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-spaas-blue/10 text-spaas-blue dark:bg-spaas-blue/20 dark:text-spaas-blue border border-spaas-blue/20">
              PLATFORM ADMIN
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Theme</span>
              <ThemeToggle />
            </div>
            <Link
              href="/dashboard"
              className="text-xs text-center px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              ← Back to App
            </Link>
            <button
              onClick={logout}
              className="text-xs px-3 py-2 rounded bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}