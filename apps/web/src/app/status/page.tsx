'use client';
import Link from 'next/link';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-spaas-navy text-gray-900 dark:text-white transition-colors">
      <div className="max-w-4xl mx-auto p-8">
        <header className="flex justify-between items-center mb-12 pb-6 border-b border-gray-200 dark:border-gray-800">
          <Logo variant="full" href="/login" height={32} />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium text-spaas-blue hover:underline">Back to Login</Link>
          </div>
        </header>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">System Status</h1>
          <p className="text-gray-500 dark:text-gray-400">Current status of SPAAS services</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </span>
            <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">All Systems Operational</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="font-medium">API & Core Services</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">Operational</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="font-medium">Database (Prisma Postgres)</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">Operational</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="font-medium">Email Delivery (Resend)</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">Operational</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="font-medium">PDF Generation Engine</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}