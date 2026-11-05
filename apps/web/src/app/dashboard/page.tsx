'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { api } from '../../lib/api';
import Link from 'next/link';

export default function DashboardPage() {
    const { logout } = useAuth();
    const [stats, setStats] = useState({ totalItems: 0, activeCustomers: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/analytics/dashboard');
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-6">
                        <h1 className="text-3xl font-bold text-blue-400">SPAAS Dashboard</h1>
                        <Link href="/masterdata" className="text-gray-400 hover:text-white underline">
                            Master Data
                        </Link>
                    </div>
                    <button onClick={logout} className="bg-red-600/20 text-red-400 px-4 py-2 rounded hover:bg-red-600/40 transition">
                        Logout
                    </button>
                </header>

                {loading ? (
                    <div className="text-xl text-gray-400">Loading analytics...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h2 className="text-gray-400 text-sm font-medium mb-2">Total Items</h2>
                                <p className="text-4xl font-bold">{stats.totalItems}</p>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h2 className="text-gray-400 text-sm font-medium mb-2">Active Customers</h2>
                                <p className="text-4xl font-bold">{stats.activeCustomers}</p>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h2 className="text-gray-400 text-sm font-medium mb-2">Total Revenue</h2>
                                <p className="text-4xl font-bold text-green-400">
                                    ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <h2 className="text-xl font-bold mb-4">Welcome to SPAAS</h2>
                            <p className="text-gray-400">Your multi-tenant ERP is up and running.</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}