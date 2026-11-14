'use client';
import Link from 'next/link';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-spaas-navy text-gray-900 dark:text-white transition-colors">
            <div className="max-w-4xl mx-auto p-8">
                <header className="flex justify-between items-center mb-12 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <Logo variant="full" href="/login" height={32} />
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link href="/login" className="text-sm font-medium text-spaas-blue hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </header>

                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Search our knowledge base or contact our support team.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-spaas-blue transition cursor-pointer">
                        <h2 className="text-xl font-bold mb-2">Getting Started</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Learn how to set up your workspace, add items, and invite your team.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-spaas-blue transition cursor-pointer">
                        <h2 className="text-xl font-bold mb-2">Sales & Invoicing</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            How to create sales orders, generate invoices, and download PDFs.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-spaas-blue transition cursor-pointer">
                        <h2 className="text-xl font-bold mb-2">Inventory & Manufacturing</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Manage stock levels, create Bills of Materials, and run production orders.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-spaas-blue transition cursor-pointer">
                        <h2 className="text-xl font-bold mb-2">Billing & Subscription</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Manage your plan, update payment methods, and view invoices.
                        </p>
                    </div>
                </div>

                <div className="mt-12 text-center bg-spaas-blue/10 border border-spaas-blue/20 p-8 rounded-xl">
                    <h2 className="text-xl font-bold mb-2">Still need help?</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Our support team is available Monday to Friday, 9am to 5pm.
                    </p>
                    <a
                        href="mailto:hello@quickie-studio.com"
                        className="inline-block bg-spaas-blue hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}