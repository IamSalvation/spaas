'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { api } from '../../lib/api';
import Link from 'next/link';

export default function SalesPage() {
    const { logout } = useAuth();
    const [customers, setCustomers] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);

    const [customerId, setCustomerId] = useState('');
    const [orderLines, setOrderLines] = useState([{ itemId: '', quantity: 1, unitPrice: 0 }]);
    const [message, setMessage] = useState('');

    const fetchData = async () => {
        const [partiesRes, itemsRes, ordersRes] = await Promise.all([
            api.get('/masterdata/parties'),
            api.get('/masterdata/items'),
            api.get('/sales/orders')
        ]);
        setCustomers(partiesRes.data.filter((p: any) => p.type === 'customer'));
        setItems(itemsRes.data);
        setOrders(ordersRes.data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddLine = () => {
        setOrderLines([...orderLines, { itemId: '', quantity: 1, unitPrice: 0 }]);
    };

    const handleLineChange = (index: number, field: string, value: any) => {
        const newLines = [...orderLines];
        newLines[index] = { ...newLines[index], [field]: value };
        setOrderLines(newLines);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Creating Order...');
        try {
            const res = await api.post('/sales/orders', {
                customerId,
                orderDate: new Date().toISOString().split('T')[0],
                lines: orderLines
            });

            const orderId = res.data.id;
            setMessage('Order created! Invoicing now...');

            await api.post('/sales/invoices', {
                salesOrderId: orderId,
                invoiceDate: new Date().toISOString().split('T')[0]
            });

            setMessage('✅ Order Created and Invoiced successfully!');
            setOrderLines([{ itemId: '', quantity: 1, unitPrice: 0 }]);
            fetchData(); // Refresh tables
        } catch (err: any) {
            setMessage(`❌ Error: ${err.response?.data?.message || 'Failed to create order'}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-6">
                        <h1 className="text-3xl font-bold text-blue-400">Sales (Order to Cash)</h1>
                        <Link href="/dashboard" className="text-gray-400 hover:text-white underline">Back to Dashboard</Link>
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

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Customer</label>
                            <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="bg-gray-700 p-2 rounded border border-gray-600 w-full max-w-md">
                                <option value="">-- Select Customer --</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Order Lines</label>
                            {orderLines.map((line, index) => (
                                <div key={index} className="flex gap-4 mb-2">
                                    <select required value={line.itemId} onChange={(e) => handleLineChange(index, 'itemId', e.target.value)} className="bg-gray-700 p-2 rounded border border-gray-600 flex-1">
                                        <option value="">-- Select Item --</option>
                                        {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                                    </select>
                                    <input type="number" min="1" placeholder="Qty" value={line.quantity} onChange={(e) => handleLineChange(index, 'quantity', Number(e.target.value))} className="bg-gray-700 p-2 rounded border border-gray-600 w-24" />
                                    <input type="number" min="0" step="0.01" placeholder="Price" value={line.unitPrice} onChange={(e) => handleLineChange(index, 'unitPrice', Number(e.target.value))} className="bg-gray-700 p-2 rounded border border-gray-600 w-32" />
                                </div>
                            ))}
                            <button type="button" onClick={handleAddLine} className="text-blue-400 hover:text-blue-300 text-sm mt-2 font-medium">+ Add Line</button>
                        </div>

                        <div className="flex justify-between items-center border-t border-gray-700 pt-6 mt-6">
                            <div className="text-xl font-bold">
                                Total: ${orderLines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0).toFixed(2)}
                            </div>
                            <button type="submit" className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded text-lg font-bold">
                                Create & Invoice Order
                            </button>
                        </div>
                    </form>
                </div>

                {/* Recent Sales Orders Table */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                        <h2 className="text-lg font-bold">Recent Sales Orders</h2>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-900/50 text-gray-400 border-b border-gray-700">
                                <th className="p-4 font-medium">Customer</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o: any) => (
                                <tr key={o.id} className="border-b border-gray-700/50">
                                    <td className="p-4">{o.customer_name}</td>
                                    <td className="p-4 text-gray-400">{o.order_date}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${o.status === 'invoiced' ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-300'}`}>
                                            {o.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}