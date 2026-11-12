'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';

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
            // Store the pending info so /pending page can show it
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl font-bold mb-2 text-center text-blue-400">Create your SPAAS account</h1>
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">Get your business running in minutes</p>

                {error && (
                    <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Company Name</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none"
                            placeholder="e.g. Acme Manufacturing"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none"
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
                            className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none"
                            placeholder="At least 8 characters"
                            minLength={8}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors mt-2"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-400 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
