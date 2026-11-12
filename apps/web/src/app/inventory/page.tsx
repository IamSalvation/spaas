'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { api } from '../../lib/api';
import Link from 'next/link';

export default function InventoryPage() {
    const { logout } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [stockData, setStockData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                // 1. Get all items
                const itemsRes = await api.get('/masterdata/items');
                const fetchedItems = itemsRes.data;
                setItems(fetchedItems);

                // 2. Fetch stock level for each item concurrently
                const stockPromises = fetchedItems.map((item: any) =>
                    api.get(`/inventory/stock/${item.id}`).then(res => ({ id: item.id, data: res.data }))
                );

                const stockResults = await Promise.all(stockPromises);

                // 3. Format into an object for easy lookup
                const stockMap: Record<string, any> = {};
                stockResults.forEach(result => {
                    stockMap[result.id] = result.data;
                });
                setStockData(stockMap);
            } catch (err) {
                console.error('Failed to load inventory', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-6">
                        <h1 className="text-3xl font-bold text-blue-400">Inventory Stock Levels</h1>
                        <Link href="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-white underline">Back to Dashboard</Link>
                    </div>
                    <button onClick={logout} className="bg-red-600/20 text-red-400 px-4 py-2 rounded hover:bg-red-600/40 transition">
                        Logout
                    </button>
                </header>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading inventory data...</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                    <th className="p-4 font-medium">SKU</th>
                                    <th className="p-4 font-medium">Item Name</th>
                                    <th className="p-4 font-medium text-right">Qty On Hand</th>
                                    <th className="p-4 font-medium text-right">Total Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => {
                                    const stock = stockData[item.id] || { quantityOnHand: '0', totalValueMinor: 0 };
                                    const qty = Number(stock.quantityOnHand);
                                    const value = stock.totalValueMinor / 100;

                                    return (
                                        <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <td className="p-4 font-mono text-sm text-blue-400">{item.sku}</td>
                                            <td className="p-4 font-medium">{item.name}</td>
                                            <td className="p-4 text-right font-mono text-lg">
                                                {qty.toLocaleString()} <span className="text-sm text-gray-500">{item.uom}</span>
                                            </td>
                                            <td className="p-4 text-right font-mono text-lg text-green-400">
                                                ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
