'use client';
import Link from 'next/link';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function AboutPage() {
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

                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-6">About SPAAS</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                        SPAAS (Software and Product As A Service) was built with a single mission: to give small and medium manufacturers the same operational power as enterprise giants, without the enterprise price tag or the 6-month implementation time.
                    </p>
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-spaas-blue">Our Philosophy</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            We believe that a 50-person factory shouldn't need a team of consultants to manage their inventory. They shouldn't need a custom API to generate an invoice. And they shouldn't have to choose between a $50,000 ERP and a spreadsheet.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                            SPAAS is built to go live in 15 minutes, not 15 months.
                        </p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        SPAAS is a product of <a href="https://quickie-studio.com" target="_blank" rel="noopener noreferrer" className="text-spaas-blue hover:underline">Quickie Studio</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}