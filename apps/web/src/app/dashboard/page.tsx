'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { api } from '../../lib/api';
import Link from 'next/link';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function DashboardPage() {
    const { logout, user } = useAuth();
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
        <div className="min-h-screen bg-gray-50 dark:bg-spaas-navy text-gray-900 dark:text-white p-8 transition-colors">
            <div className="max-w-6xl mx-auto">

                {/* Added flex-wrap and gap-4 so the toggle never gets pushed off-screen */}
                <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
                    <div className="flex flex-wrap items-center gap-6">
                        {/* Logo replaces the text title */}
                        <Logo variant="full" href="/dashboard" height={32} />

                        {/* Navigation Links */}
                        {(user?.role === 'admin' || user?.role === 'sales') && (
                            <Link href="/sales" className="text-gray-500 dark:text-gray-400 hover:text-spaas-blue dark:hover:text-white text-sm font-medium transition-colors">
                                Sales
                            </Link>
                        )}
                        {(user?.role === 'admin' || user?.role === 'procurement') && (
                            <Link href="/procurement" className="text-gray-500 dark:text-gray-400 hover:text-spaas-blue dark:hover:text-white text-sm font-medium transition-colors">
                                Procurement
                            </Link>
                        )}
                        {(user?.role === 'admin' || user?.role === 'procurement') && (
                            <Link href="/inventory" className="text-gray-500 dark:text-gray-400 hover:text-spaas-blue dark:hover:text-white text-sm font-medium transition-colors">
                                Inventory
                            </Link>
                        )}
                        <Link href="/masterdata" className="text-gray-500 dark:text-gray-400 hover:text-spaas-blue dark:hover:text-white text-sm font-medium transition-colors">
                            Master Data
                        </Link>
                        <Link href="/reports" className="text-gray-500 dark:text-gray-400 hover:text-spaas-blue dark:hover:text-white text-sm font-medium transition-colors">
                            Reports
                        </Link>
                        {user?.role === 'admin' && (
                            <Link href="/team" className="text-gray-500 dark:text-gray-400 hover:text-spaas-blue dark:hover:text-white text-sm font-medium transition-colors">
                                Team
                            </Link>
                        )}
                        {user?.role === 'admin' && (
                            <Link href="/audit" className="text-gray-500 dark:text-gray-400 hover:text-spaas-blue dark:hover:text-white text-sm font-medium transition-colors">
                                Audit Log
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={logout}
                            className="bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="text-xl text-gray-500 dark:text-gray-400">Loading analytics...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white dark:bg-spaas-surface p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                                <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Total Items</h2>
                                <p className="text-4xl font-bold">{stats.totalItems}</p>
                            </div>
                            <div className="bg-white dark:bg-spaas-surface p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                                <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Active Customers</h2>
                                <p className="text-4xl font-bold">{stats.activeCustomers}</p>
                            </div>
                            <div className="bg-white dark:bg-spaas-surface p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                                <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Total Revenue</h2>
                                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                                    ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-spaas-surface p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                            <h2 className="text-xl font-bold mb-4">Welcome to SPAAS, {user?.email}</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Your role is: <span className="font-bold capitalize">{user?.role}</span>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}