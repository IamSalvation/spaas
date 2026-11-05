'use client';
import { useAuth } from '../../components/AuthProvider';

export default function DashboardPage() {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-400">SPAAS Dashboard</h1>
                    <button onClick={logout} className="bg-red-600/20 text-red-400 px-4 py-2 rounded hover:bg-red-600/40 transition">
                        Logout
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-gray-400 text-sm font-medium mb-2">Total Items</h2>
                        <p className="text-4xl font-bold">-</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-gray-400 text-sm font-medium mb-2">Active Customers</h2>
                        <p className="text-4xl font-bold">-</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-gray-400 text-sm font-medium mb-2">Total Revenue</h2>
                        <p className="text-4xl font-bold text-green-400">-</p>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold mb-4">Welcome to SPAAS</h2>
                    <p className="text-gray-400">Your multi-tenant ERP is up and running.</p>
                </div>
            </div>
        </div>
    );
}