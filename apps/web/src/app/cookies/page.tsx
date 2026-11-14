'use client';
import Link from 'next/link';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function CookiePolicyPage() {
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

                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: November 2026</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work efficiently and to provide information to the owners of the site.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            SPAAS uses strictly necessary cookies to keep you logged in and to secure your session. We use local storage (not cookies) to remember your theme preference (Light or Dark mode).
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. Managing Cookies</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            You can set your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you disable cookies, you will not be able to log in to SPAAS.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}