'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { api } from '../../lib/api';
import Link from 'next/link';

export default function ReportsPage() {
    const { logout } = useAuth();
    const [trialBalance, setTrialBalance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await api.get('/finance/reports/trial-balance');
                setTrialBalance(res.data);
            } catch (err) {
                console.error('Failed to load reports', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    // Calculate totals for the footer
    const totalDebits = trialBalance.reduce((sum, acc) => sum + Number(acc.total_debit), 0);
    const totalCredits = trialBalance.reduce((sum, acc) => sum + Number(acc.total_credit), 0);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-6">
                        <h1 className="text-3xl font-bold text-blue-400">Financial Reports</h1>
                        <Link href="/dashboard" className="text-gray-400 hover:text-white underline">Back to Dashboard</Link>
                    </div>
                    <button onClick={logout} className="bg-red-600/20 text-red-400 px-4 py-2 rounded hover:bg-red-600/40 transition">
                        Logout
                    </button>
                </header>

                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-700 bg-gray-800/50">
                        <h2 className="text-xl font-bold">Trial Balance</h2>
                        <p className="text-sm text-gray-400">As of {new Date().toLocaleDateString()}</p>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Calculating ledger balances...</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-900/50 text-gray-400 border-b border-gray-700">
                                    <th className="p-4 font-medium">Code</th>
                                    <th className="p-4 font-medium">Account Name</th>
                                    <th className="p-4 font-medium">Type</th>
                                    <th className="p-4 font-medium text-right">Debit</th>
                                    <th className="p-4 font-medium text-right">Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trialBalance.map((acc, index) => (
                                    <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4 font-mono text-sm text-blue-400">{acc.code}</td>
                                        <td className="p-4 font-medium">{acc.name}</td>
                                        <td className="p-4 text-sm capitalize text-gray-400">{acc.type}</td>
                                        <td className="p-4 text-right font-mono text-green-400">
                                            {Number(acc.total_debit) > 0 ? `$${(Number(acc.total_debit) / 100).toFixed(2)}` : '-'}
                                        </td>
                                        <td className="p-4 text-right font-mono text-red-400">
                                            {Number(acc.total_credit) > 0 ? `$${(Number(acc.total_credit) / 100).toFixed(2)}` : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-900/80 font-bold border-t-2 border-gray-600">
                                <tr>
                                    <td colSpan={3} className="p-4 text-right">Totals:</td>
                                    <td className="p-4 text-right font-mono text-green-400">${(totalDebits / 100).toFixed(2)}</td>
                                    <td className="p-4 text-right font-mono text-red-400">${(totalCredits / 100).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>

                {/* Proof of Balance */}
                {!loading && (
                    <div className={`p-4 rounded-lg border ${totalDebits === totalCredits ? 'bg-green-900/20 border-green-700 text-green-400' : 'bg-red-900/20 border-red-700 text-red-400'}`}>
                        {totalDebits === totalCredits
                            ? '✅ The books are perfectly balanced. Total Debits equal Total Credits.'
                            : '❌ Warning: The books are out of balance!'}
                    </div>
                )}
            </div>
        </div>
    );
}