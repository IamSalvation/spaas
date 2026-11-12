'use client';
import { useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { api } from '../../lib/api';
import Link from 'next/link';

export default function TeamPage() {
    const { logout } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('sales');
    const [message, setMessage] = useState('');

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Inviting user...');
        try {
            await api.post('/auth/users', { email, password, role });
            setMessage(`âœ… User ${email} added successfully as ${role}!`);
            setEmail(''); setPassword('');
        } catch (err: any) {
            setMessage(`âŒ Error: ${err.response?.data?.message || 'Failed to add user'}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-6">
                        <h1 className="text-3xl font-bold text-blue-400">Team Management</h1>
                        <Link href="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-white underline">Back to Dashboard</Link>
                    </div>
                    <button onClick={logout} className="bg-red-600/20 text-red-400 px-4 py-2 rounded hover:bg-red-600/40 transition">
                        Logout
                    </button>
                </header>

                {message && (
                    <div className="bg-blue-600/20 border border-blue-500/50 text-blue-200 p-4 rounded mb-6">
                        {message}
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-4">Invite a New User</h2>
                    <form onSubmit={handleInvite} className="flex flex-col gap-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600" placeholder="buyer@acme.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Temporary Password</label>
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Role</label>
                            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600">
                                <option value="admin">Admin (Full Access)</option>
                                <option value="sales">Sales (Sales & Master Data)</option>
                                <option value="procurement">Procurement (Buying & Inventory)</option>
                            </select>
                        </div>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold mt-2">
                            Create User
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
