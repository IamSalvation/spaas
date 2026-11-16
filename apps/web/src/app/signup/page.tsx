'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function SignupPage() {
    const router = useRouter();
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { companyName, email, password });
            sessionStorage.setItem('spaas_pending_info', JSON.stringify({
                companyName: res.data.tenant?.name || companyName,
                slug: res.data.tenant?.slug || '',
                email: res.data.user?.email || email,
            }));
            router.push('/pending');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                <div className="w-full max-w-md bg-white/95 dark:bg-spaas-navy/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-2xl border border-white/20">

                    <div className="flex justify-center mb-6">
                        <Logo variant="icon" href="/login" height={48} />
                    </div>

                    <h1 className="text-2xl font-bold text-center mb-1 text-gray-900 dark:text-white">Create your account</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm">
                        Get your business running in minutes.
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Company Name</label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:border-spaas-blue focus:ring-1 focus:ring-spaas-blue outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="e.g. Acme Manufacturing"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:border-spaas-blue focus:ring-1 focus:ring-spaas-blue outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="you@company.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:border-spaas-blue focus:ring-1 focus:ring-spaas-blue outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="At least 8 characters"
                                minLength={8}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-spaas-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-2"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-spaas-blue hover:underline font-medium">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}