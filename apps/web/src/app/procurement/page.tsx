'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { api } from '../../lib/api';
import Link from 'next/link';

export default function ProcurementPage() {
    const { logout } = useAuth();
    const [vendors, setVendors] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);

    // Order Form State
    const [vendorId, setVendorId] = useState('');
    const [orderLines, setOrderLines] = useState([{ itemId: '', quantity: 1, unitCost: 0 }]);
    const [message, setMessage] = useState('');

    // Fetch Master Data
    useEffect(() => {
        const fetchData = async () => {
            const [partiesRes, itemsRes] = await Promise.all([
                api.get('/masterdata/parties'),
                api.get('/masterdata/items')
            ]);
            setVendors(partiesRes.data.filter((p: any) => p.type === 'vendor'));
            setItems(itemsRes.data);
        };
        fetchData();
    }, []);

    const handleAddLine = () => {
        setOrderLines([...orderLines, { itemId: '', quantity: 1, unitCost: 0 }]);
    };

    const handleLineChange = (index: number, field: string, value: any) => {
        const newLines = [...orderLines];
        newLines[index] = { ...newLines[index], [field]: value };
        setOrderLines(newLines);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Creating Purchase Order...');
        try {
            // 1. Create Purchase Order
            const res = await api.post('/procurement/orders', {
                vendorId,
                orderDate: new Date().toISOString().split('T')[0],
                lines: orderLines
            });

            const orderId = res.data.id;
            setMessage('Order created! Receiving stock now...');

            // 2. Automatically Receive it (This updates inventory and finance)
            await api.post('/procurement/orders/receive', {
                purchaseOrderId: orderId
            });

            setMessage('✅ Purchase Order Created and Stock Received successfully!');
            setOrderLines([{ itemId: '', quantity: 1, unitCost: 0 }]);
        } catch (err: any) {
            setMessage(`❌ Error: ${err.response?.data?.message || 'Failed to create order'}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-6">
                        <h1 className="text-3xl font-bold text-blue-400">Procurement (Purchase to Pay)</h1>
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

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Vendor</label>
                            <select required value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="bg-gray-700 p-2 rounded border border-gray-600 w-full max-w-md">
                                <option value="">-- Select Vendor --</option>
                                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
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
                                    <input type="number" min="0.01" step="0.01" placeholder="Qty" value={line.quantity} onChange={(e) => handleLineChange(index, 'quantity', Number(e.target.value))} className="bg-gray-700 p-2 rounded border border-gray-600 w-24" />
                                    <input type="number" min="0" step="0.01" placeholder="Unit Cost" value={line.unitCost} onChange={(e) => handleLineChange(index, 'unitCost', Number(e.target.value))} className="bg-gray-700 p-2 rounded border border-gray-600 w-32" />
                                </div>
                            ))}
                            <button type="button" onClick={handleAddLine} className="text-blue-400 hover:text-blue-300 text-sm mt-2 font-medium">+ Add Line</button>
                        </div>

                        <div className="flex justify-between items-center border-t border-gray-700 pt-6 mt-6">
                            <div className="text-xl font-bold">
                                Total: ${orderLines.reduce((sum, line) => sum + (line.quantity * line.unitCost), 0).toFixed(2)}
                            </div>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded text-lg font-bold">
                                Create & Receive Order
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}