'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { api } from '../../lib/api';
import Link from 'next/link';

export default function ManufacturingPage() {
    const { logout } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [message, setMessage] = useState('');

    const [productItemId, setProductItemId] = useState('');
    const [bomLines, setBomLines] = useState([{ componentItemId: '', quantity: 1 }]);

    const [prodItemId, setProdItemId] = useState('');
    const [targetQuantity, setTargetQuantity] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            const itemsRes = await api.get('/masterdata/items');
            setItems(itemsRes.data);
        };
        fetchData();
    }, []);

    const handleAddBomLine = () => {
        setBomLines([...bomLines, { componentItemId: '', quantity: 1 }]);
    };

    const handleBomLineChange = (index: number, field: string, value: any) => {
        const newLines = [...bomLines];
        newLines[index] = { ...newLines[index], [field]: value };
        setBomLines(newLines);
    };

    const handleCreateBom = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Creating BOM...');
        try {
            await api.post('/manufacturing/bom', {
                productItemId,
                components: bomLines
            });
            setMessage('✅ Bill of Materials created successfully!');
            setBomLines([{ componentItemId: '', quantity: 1 }]);
        } catch (err: any) {
            setMessage(`❌ Error: ${err.response?.data?.message || 'Failed to create BOM'}`);
        }
    };

    const handleCreateProduction = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Creating Production Order...');
        try {
            const res = await api.post('/manufacturing/orders', {
                productItemId: prodItemId,
                targetQuantity: targetQuantity
            });
            const orderId = res.data.id;
            setMessage('Order created. Completing production...');

            await api.post('/manufacturing/orders/complete', {
                orderId: orderId
            });

            setMessage('✅ Production Order Completed! Components consumed, Finished Goods created.');

            // Auto-download the production order PDF
            try {
                const pdfRes = await api.get(`/documents/production-order/${orderId}`, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `production-order-${orderId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } catch (e) {
                console.error('Could not download PDF', e);
            }
        } catch (err: any) {
            setMessage(`❌ Error: ${err.response?.data?.message || 'Failed to complete production'}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-6">
                        <h1 className="text-3xl font-bold text-blue-400">Manufacturing</h1>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* BILL OF MATERIALS */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Bill of Materials (BOM)</h2>
                        <form onSubmit={handleCreateBom}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Finished Product</label>
                                <select required value={productItemId} onChange={(e) => setProductItemId(e.target.value)} className="bg-gray-700 p-2 rounded border border-gray-600 w-full">
                                    <option value="">-- Select Product to Manufacture --</option>
                                    {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Components Required</label>
                                {bomLines.map((line, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <select required value={line.componentItemId} onChange={(e) => handleBomLineChange(index, 'componentItemId', e.target.value)} className="bg-gray-700 p-2 rounded border border-gray-600 flex-1">
                                            <option value="">-- Select Component --</option>
                                            {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                                        </select>
                                        <input type="number" min="0.01" step="0.01" placeholder="Qty" value={line.quantity} onChange={(e) => handleBomLineChange(index, 'quantity', Number(e.target.value))} className="bg-gray-700 p-2 rounded border border-gray-600 w-24" />
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddBomLine} className="text-blue-400 hover:text-blue-300 text-sm mt-2 font-medium">+ Add Component</button>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold mt-2">
                                Save Bill of Materials
                            </button>
                        </form>
                    </div>

                    {/* PRODUCTION ORDERS */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Run Production Order</h2>
                        <form onSubmit={handleCreateProduction}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Product to Manufacture</label>
                                <select required value={prodItemId} onChange={(e) => setProdItemId(e.target.value)} className="bg-gray-700 p-2 rounded border border-gray-600 w-full">
                                    <option value="">-- Select Product --</option>
                                    {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">Target Quantity</label>
                                <input type="number" min="1" required value={targetQuantity} onChange={(e) => setTargetQuantity(Number(e.target.value))} className="bg-gray-700 p-2 rounded border border-gray-600 w-full" />
                            </div>

                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold text-lg">
                                Create & Complete Production Order
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}