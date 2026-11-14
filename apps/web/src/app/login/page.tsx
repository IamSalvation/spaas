'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';
import { PublicFooter } from '../../components/PublicFooter';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password, identifier);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col">

            {/* 1. FULL WIDTH BACKGROUND IMAGE */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/login-background.jpg"
                    alt="Workspace"
                    className="w-full h-full object-cover"
                />
                {/* Dark overlay to make text readable */}
                <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
            </div>

            {/* 2. HEADER: Logo top-left, Toggle top-right */}
            <div className="relative z-10 flex justify-between items-center p-6 sm:p-8">
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl">
                    <Logo variant="full" href="/login" height={32} />
                </div>
                <ThemeToggle />
            </div>

            {/* 3. FORM CONTAINER - Aligned Left */}
            <div className="relative z-10 flex-1 flex items-center justify-start p-4 lg:p-0 lg:pl-16 xl:pl-32 pb-16">
                <div className="w-full max-w-md bg-white/95 dark:bg-spaas-navy/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-2xl border border-white/20">

                    <div className="flex justify-center mb-6">
                        <Logo variant="icon" href="/login" height={48} />
                    </div>

                    <h1 className="text-2xl font-bold text-center mb-1">Welcome back</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm">
                        Enter your credentials to access your workspace.
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Company Workspace</label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:border-spaas-blue focus:ring-1 focus:ring-spaas-blue outline-none transition-all"
                                placeholder="e.g. acme-mfg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:border-spaas-blue focus:ring-1 focus:ring-spaas-blue outline-none transition-all"
                                placeholder="you@company.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:border-spaas-blue focus:ring-1 focus:ring-spaas-blue outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-spaas-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-2"
                        >
                            {loading ? 'Logging in...' : 'Login to SPAAS'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-spaas-blue hover:underline font-medium">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>

            {/* 4. THE GLASS FOOTER (Added here) */}
            <PublicFooter />

        </div>
    );
}