'use client';
import Link from 'next/link';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function ApiDocsPage() {
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

                <h1 className="text-4xl font-bold mb-2">API Documentation</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Integrate SPAAS with your own tools.</p>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
                    <h2 className="text-xl font-bold mb-4">Authentication</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        All API requests require a JWT Bearer token. You can obtain a token by calling the <code className="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-sm font-mono text-spaas-blue">/auth/login</code> endpoint.
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        {`POST /auth/login
Content-Type: application/json

{
  "email": "admin@acme.com",
  "password": "yourpassword",
  "identifier": "acme-mfg"
}`}
                    </pre>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Core Endpoints</h2>
                    <ul className="space-y-3 text-gray-600 dark:text-gray-300 font-mono text-sm">
                        <li><span className="text-emerald-500 font-bold">GET</span> /analytics/dashboard</li>
                        <li><span className="text-emerald-500 font-bold">GET</span> /masterdata/items</li>
                        <li><span className="text-blue-500 font-bold">POST</span> /sales/orders</li>
                        <li><span className="text-blue-500 font-bold">POST</span> /procurement/orders</li>
                        <li><span className="text-emerald-500 font-bold">GET</span> /inventory/stock/:itemId</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}