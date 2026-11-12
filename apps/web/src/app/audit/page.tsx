'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { api } from '../../lib/api';
import Link from 'next/link';

export default function AuditPage() {
    const { logout, user } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await api.get('/compliance/logs');
            setLogs(res.data);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-6">
                        <h1 className="text-3xl font-bold text-blue-400">Security & Audit Log</h1>
                        <Link href="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-white underline">Back to Dashboard</Link>
                    </div>
                    <button onClick={logout} className="bg-red-600/20 text-red-400 px-4 py-2 rounded hover:bg-red-600/40 transition">
                        Logout
                    </button>
                </header>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <h2 className="text-lg font-bold">Immutable Activity Feed (Last 100 Actions)</h2>
                        <button onClick={fetchLogs} className="text-sm text-blue-400 hover:text-white underline">
                            Refresh
                        </button>
                    </div>

                    {error ? (
                        <div className="p-8 text-center">
                            <p className="text-red-400 mb-4">Failed to connect to the database. It might be waking up.</p>
                            <button onClick={fetchLogs} className="bg-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-700">
                                Retry Connection
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No actions recorded yet. Try creating a Sales Order or Procurement Order first!
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                    <th className="p-4 font-medium">Timestamp</th>
                                    <th className="p-4 font-medium">User</th>
                                    <th className="p-4 font-medium">Action</th>
                                    <th className="p-4 font-medium">Resource</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log: any) => (
                                    <tr key={log.id} className="border-b border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                                        <td className="p-4 font-medium">{log.userEmail}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${log.action === 'POST' ? 'bg-green-900/50 text-green-400' :
                                                    log.action === 'DELETE' ? 'bg-red-900/50 text-red-400' :
                                                        'bg-blue-900/50 text-blue-400'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-sm text-gray-600 dark:text-gray-300">{log.resource}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
