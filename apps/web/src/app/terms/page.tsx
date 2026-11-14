'use client';
import Link from 'next/link';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-spaas-navy text-gray-900 dark:text-white transition-colors">
            <div className="max-w-4xl mx-auto p-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-12 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <Logo variant="full" href="/login" height={32} />
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link href="/login" className="text-sm font-medium text-spaas-blue hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: November 2026</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            By accessing or using SPAAS (Software and Product As A Service), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Permission is granted to temporarily download one copy of the materials (information or software) on SPAAS's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Under this license you may not:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-gray-600 dark:text-gray-300">
                            <li>Modify or copy the materials;</li>
                            <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                            <li>Attempt to decompile or reverse engineer any software contained on SPAAS;</li>
                            <li>Remove any copyright or other proprietary notations from the materials.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            The materials on SPAAS are provided on an 'as is' basis. SPAAS makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            In no event shall SPAAS or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on SPAAS.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Contact</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            If you have any questions about these Terms, please contact us at <a href="mailto:hello@quickie-studio.com" className="text-spaas-blue hover:underline">hello@quickie-studio.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}