'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';

interface PendingInfo {
    companyName: string;
    slug: string;
    email: string;
}

export default function PendingPage() {
    const [info, setInfo] = useState<PendingInfo | null>(null);

    useEffect(() => {
        const raw = sessionStorage.getItem('spaas_pending_info');
        if (raw) setInfo(JSON.parse(raw));
    }, []);

    return (
        <div className="min-h-screen relative flex flex-col">

            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/login-background.jpg"
                    alt="Workspace"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
            </div>

            {/* Header: Logo & Toggle */}
            <div className="relative z-10 flex justify-between items-center p-6 sm:p-8">
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl">
                    <Logo variant="full" href="/login" height={32} />
                </div>
                <ThemeToggle />
            </div>

            {/* Form Card */}
            <div className="relative z-10 flex-1 flex items-center justify-start p-4 lg:p-0 lg:pl-16 xl:pl-32 pb-16">
                <div className="w-full max-w-md bg-white/95 dark:bg-spaas-navy/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-2xl border border-white/20 text-center">

                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✅</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-emerald-600 dark:text-emerald-400">Account Created</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                        Your account is being reviewed by our team.
                    </p>

                    {info && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-6 text-left border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr>
                                        <td className="text-gray-500 py-1">Company</td>
                                        <td className="text-gray-900 dark:text-white font-medium text-right">{info.companyName}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-gray-500 py-1">Workspace</td>
                                        <td className="text-gray-900 dark:text-white font-mono text-right">{info.slug}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-gray-500 py-1">Email</td>
                                        <td className="text-gray-900 dark:text-white text-right">{info.email}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        We usually approve new accounts within a few hours.
                        <br />
                        You&apos;ll receive an email once approved.
                    </p>

                    <Link
                        href="/login"
                        className="inline-block w-full bg-spaas-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}