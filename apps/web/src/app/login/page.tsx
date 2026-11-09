'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">SPAAS Login</h1>

                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Company Workspace</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none text-sm"
                            placeholder="e.g. acme-mfg"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Your workspace slug</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors mt-2"
                    >
                        {loading ? 'Logging in...' : 'Login to SPAAS'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-blue-400 hover:underline">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}