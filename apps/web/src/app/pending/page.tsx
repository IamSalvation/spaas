'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 text-center">
                <div className="w-16 h-16 rounded-full bg-green-900/50 border border-green-800 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">âœ…</span>
                </div>
                <h1 className="text-2xl font-bold mb-2 text-green-400">Account Created</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Your account is being reviewed by our team.
                </p>

                {info && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6 text-left border border-gray-200 dark:border-gray-700">
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

                <p className="text-gray-500 text-xs mb-6">
                    Questions? Reply to{' '}
                    <a href="mailto:hello@quickie-studio.com" className="text-blue-400 hover:underline">
                        hello@quickie-studio.com
                    </a>
                </p>

                <Link
                    href="/login"
                    className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
