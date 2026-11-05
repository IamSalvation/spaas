'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { api } from '../../lib/api';
import Link from 'next/link';

export default function MasterDataPage() {
    const { logout } = useAuth();
    const [parties, setParties] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [partyType, setPartyType] = useState('customer');
    const [partyName, setPartyName] = useState('');
    const [partyEmail, setPartyEmail] = useState('');

    const [itemSku, setItemSku] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemUom, setItemUom] = useState('EA');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [partiesRes, itemsRes] = await Promise.all([
                api.get('/masterdata/parties'),
                api.get('/masterdata/items')
            ]);
            setParties(partiesRes.data);
            setItems(itemsRes.data);
        } catch (err) {
            console.error('Failed to fetch masterdata', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateParty = async (e: React.FormEvent) => {
        e.preventDefault();
        await api.post('/masterdata/parties', { type: partyType, name: partyName, email: partyEmail });
        setPartyName(''); setPartyEmail('');
        fetchData(); // Refresh
    };

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        await api.post('/masterdata/items', { sku: itemSku, name: itemName, uom: itemUom });
        setItemSku(''); setItemName(''); setItemUom('EA');
        fetchData(); // Refresh
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-6">
                        <h1 className="text-3xl font-bold text-blue-400">Master Data</h1>
                        <Link href="/dashboard" className="text-gray-400 hover:text-white underline">Back to Dashboard</Link>
                    </div>
                    <button onClick={logout} className="bg-red-600/20 text-red-400 px-4 py-2 rounded hover:bg-red-600/40 transition">
                        Logout
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* PARTIES (Customers & Vendors) */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Customers & Vendors</h2>

                        <form onSubmit={handleCreateParty} className="flex flex-col gap-2 mb-6">
                            <div className="flex gap-2">
                                <select value={partyType} onChange={(e) => setPartyType(e.target.value)} className="bg-gray-700 p-2 rounded border border-gray-600 w-32">
                                    <option value="customer">Customer</option>
                                    <option value="vendor">Vendor</option>
                                </select>
                                <input type="text" placeholder="Name" value={partyName} onChange={(e) => setPartyName(e.target.value)} className="bg-gray-700 p-2 rounded border border-gray-600 flex-1" required />
                            </div>
                            <div className="flex gap-2">
                                <input type="email" placeholder="Email (Optional)" value={partyEmail} onChange={(e) => setPartyEmail(e.target.value)} className="bg-gray-700 p-2 rounded border border-gray-600 flex-1" />
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold">Add</button>
                            </div>
                        </form>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-700 text-gray-400">
                                        <th className="p-2">Type</th>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parties.map(p => (
                                        <tr key={p.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                            <td className="p-2 capitalize text-sm">{p.type}</td>
                                            <td className="p-2 font-medium">{p.name}</td>
                                            <td className="p-2 text-gray-400 text-sm">{p.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ITEMS */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Items (Products)</h2>

                        <form onSubmit={handleCreateItem} className="flex flex-col gap-2 mb-6">
                            <div className="flex gap-2">
                                <input type="text" placeholder="SKU" value={itemSku} onChange={(e) => setItemSku(e.target.value)} className="bg-gray-700 p-2 rounded border border-gray-600 w-32" required />
                                <input type="text" placeholder="Name" value={itemName} onChange={(e) => setItemName(e.target.value)} className="bg-gray-700 p-2 rounded border border-gray-600 flex-1" required />
                            </div>
                            <div className="flex gap-2">
                                <input type="text" placeholder="UOM (e.g. EA, KG)" value={itemUom} onChange={(e) => setItemUom(e.target.value)} className="bg-gray-700 p-2 rounded border border-gray-600 flex-1" required />
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold">Add</button>
                            </div>
                        </form>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-700 text-gray-400">
                                        <th className="p-2">SKU</th>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">UOM</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(i => (
                                        <tr key={i.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                            <td className="p-2 font-mono text-sm text-blue-400">{i.sku}</td>
                                            <td className="p-2 font-medium">{i.name}</td>
                                            <td className="p-2 text-gray-400 text-sm">{i.uom}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}