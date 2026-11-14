'use client';
import Link from 'next/link';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function PrivacyPage() {
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

                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: November 2026</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            We collect information you provide directly to us. For example, we collect information when you create an account, subscribe to our newsletter, or communicate with us. The types of information we may collect include your name, email address, company name, and any other information you choose to provide.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            We use the information we collect to provide, maintain, and improve our services, to send you technical notices, updates, security alerts, and support and administrative messages, and to respond to your comments, questions, and requests.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. Data Isolation</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            SPAAS operates on a multi-tenant architecture. Your business data is strictly isolated. We use application-level filters and database-level rules to ensure that no other company can see, access, or modify your data.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. All data is encrypted at rest and in transit.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@quickie-studio.com" className="text-spaas-blue hover:underline">hello@quickie-studio.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}