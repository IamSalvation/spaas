'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PlatformGuard } from '../../../../components/PlatformGuard';
import { PlatformShell } from '../../../../components/PlatformShell';
import { api } from '../../../../lib/api';

interface TenantDetail {
    tenant: {
        id: string;
        name: string;
        slug: string;
        status: string;
        tier: string;
        maxUsers: number;
        maxItems: number;
        maxTransactionsPerMonth: number;
        accessExpiresAt: string | null;
        lockoutGraceDays: number;
        createdAt: string;
    };
    users: Array<{
        id: string;
        email: string;
        role: string;
        isOwner: boolean;
        isPlatformAdmin: boolean;
        createdAt: string;
    }>;
    stats: {
        item_count: number;
        party_count: number;
        sales_count: number;
        po_count: number;
        revenue_minor: string;
    };
}

function statusClass(status: string): string {
    switch (status) {
        case 'active': return 'bg-emerald-900/50 text-emerald-400 border border-emerald-800';
        case 'pending': return 'bg-amber-900/50 text-amber-400 border border-amber-800';
        case 'paused': return 'bg-orange-900/50 text-orange-400 border border-orange-800';
        case 'deleted': return 'bg-red-900/50 text-red-400 border border-red-800';
        default: return 'bg-gray-700 text-gray-300';
    }
}

function tierClass(tier: string): string {
    switch (tier) {
        case 'v2': return 'bg-violet-900/50 text-violet-400 border border-violet-800';
        case 'v3': return 'bg-fuchsia-900/50 text-fuchsia-400 border border-fuchsia-800';
        default: return 'bg-gray-700 text-gray-300 border border-gray-600';
    }
}

function DetailInner() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = params?.id;
    const [data, setData] = useState<TenantDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [working, setWorking] = useState(false);
    const [editingLimits, setEditingLimits] = useState(false);
    const [limitForm, setLimitForm] = useState({
        maxUsers: 5,
        maxItems: 100,
        maxTransactionsPerMonth: 1000,
        accessExpiresAt: '',
        lockoutGraceDays: 7,
    });

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/platform/tenants/${id}`);
            setData(res.data);
            setLimitForm({
                maxUsers: res.data.tenant.maxUsers,
                maxItems: res.data.tenant.maxItems,
                maxTransactionsPerMonth: res.data.tenant.maxTransactionsPerMonth,
                accessExpiresAt: res.data.tenant.accessExpiresAt
                    ? res.data.tenant.accessExpiresAt.split('T')[0]
                    : '',
                lockoutGraceDays: res.data.tenant.lockoutGraceDays,
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load tenant');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    async function updateStatus(status: string, label: string) {
        if (!confirm(label)) return;
        setWorking(true);
        try {
            await api.patch(`/platform/tenants/${id}/status`, { status });
            await load();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed');
        } finally { setWorking(false); }
    }

    async function toggleTier() {
        if (!data) return;
        const current = data.tenant.tier;
        const next = current === 'v1' ? 'v2' : current === 'v2' ? 'v3' : 'v1';
        if (!confirm(`Change tier from ${current.toUpperCase()} to ${next.toUpperCase()}?`)) return;
        setWorking(true);
        try {
            await api.patch(`/platform/tenants/${id}/tier`, { tier: next });
            await load();
        } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
        finally { setWorking(false); }
    }

    async function saveLimits(e: React.FormEvent) {
        e.preventDefault();
        setWorking(true);
        try {
            await api.patch(`/platform/tenants/${id}/limits`, {
                maxUsers: Number(limitForm.maxUsers),
                maxItems: Number(limitForm.maxItems),
                maxTransactionsPerMonth: Number(limitForm.maxTransactionsPerMonth),
                accessExpiresAt: limitForm.accessExpiresAt || null,
                lockoutGraceDays: Number(limitForm.lockoutGraceDays),
            });
            setEditingLimits(false);
            await load();
        } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
        finally { setWorking(false); }
    }

    async function handleHardDelete() {
        if (!data) return;

        const typed = prompt(
            `⚠️ DANGER: This will PERMANENTLY delete "${data.tenant.name}" and ALL its data:\n\n` +
            `- All users\n` +
            `- All items and parties\n` +
            `- All sales orders and invoices\n` +
            `- All purchase orders\n` +
            `- All inventory and stock movements\n` +
            `- All financial journal entries\n` +
            `- All audit logs\n\n` +
            `This cannot be undone.\n\n` +
            `Type the exact tenant name to confirm:`
        );

        if (typed === null) return;
        if (typed !== data.tenant.name) {
            alert('Name did not match. Hard delete cancelled.');
            return;
        }

        setWorking(true);
        try {
            await api.post(`/platform/tenants/${id}/hard-delete`, {
                confirmName: typed,
            });
            alert(`Tenant "${data.tenant.name}" has been permanently deleted.`);
            router.push('/platform/tenants');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete tenant');
        } finally {
            setWorking(false);
        }
    }

    if (loading) return <div className="p-8 text-gray-400">Loading tenant...</div>;
    if (error) return <div className="p-8 text-red-400">{error}</div>;
    if (!data) return null;

    const t = data.tenant;
    const revenue = (Number(data.stats.revenue_minor) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

    return (
        <div className="p-8">
            <Link href="/platform/tenants" className="text-xs text-gray-400 hover:text-white hover:underline">
                &larr; Back to Tenants
            </Link>

            <div className="mt-3 flex items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t.name}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono text-gray-400">{t.slug}</span>
                        <span className={`px-2 py-0.5 rounded font-medium ${statusClass(t.status)}`}>
                            {t.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-medium ${tierClass(t.tier)}`}>
                            {t.tier.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {t.status === 'pending' && (
                        <button onClick={() => updateStatus('active', 'Approve this tenant?')} disabled={working}
                            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50">
                            Approve
                        </button>
                    )}
                    {t.status === 'active' && (
                        <button onClick={() => updateStatus('paused', 'Pause this tenant? They will be logged out.')} disabled={working}
                            className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium disabled:opacity-50">
                            Pause
                        </button>
                    )}
                    {(t.status === 'paused' || t.status === 'deleted') && (
                        <button onClick={() => updateStatus('active', 'Restore this tenant?')} disabled={working}
                            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50">
                            Restore
                        </button>
                    )}
                    <button onClick={toggleTier} disabled={working}
                        className="px-4 py-2 rounded border border-gray-600 text-gray-300 text-sm hover:bg-gray-700 disabled:opacity-50">
                        Change Tier
                    </button>
                    {t.status !== 'deleted' && (
                        <button onClick={() => updateStatus('deleted', 'Soft-delete this tenant? Data is preserved.')} disabled={working}
                            className="px-4 py-2 rounded border border-red-800 text-red-400 text-sm hover:bg-red-900/30 disabled:opacity-50">
                            Soft Delete
                        </button>
                    )}
                    <button onClick={handleHardDelete} disabled={working}
                        className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-50">
                        Hard Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <StatCard label="Users" value={data.users.length} limit={t.maxUsers} />
                <StatCard label="Items" value={data.stats.item_count} limit={t.maxItems} />
                <StatCard label="Parties" value={data.stats.party_count} />
                <StatCard label="Sales" value={data.stats.sales_count} />
                <StatCard label="Purchase Orders" value={data.stats.po_count} />
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Revenue</div>
                    <div className="mt-1 text-2xl font-semibold text-green-400">${revenue}</div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-medium text-white">Access Limits</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Plan quotas and access expiry</p>
                    </div>
                    {!editingLimits && (
                        <button onClick={() => setEditingLimits(true)}
                            className="px-3 py-1.5 rounded border border-gray-600 text-xs text-gray-300 hover:bg-gray-700">
                            Edit
                        </button>
                    )}
                </div>
                <div className="p-4">
                    {editingLimits ? (
                        <form onSubmit={saveLimits} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Field label="Max Users">
                                    <input type="number" min="1" value={limitForm.maxUsers}
                                        onChange={(e) => setLimitForm({ ...limitForm, maxUsers: Number(e.target.value) })}
                                        className="w-full bg-gray-700 p-2 rounded border border-gray-600 text-sm" />
                                </Field>
                                <Field label="Max Items">
                                    <input type="number" min="1" value={limitForm.maxItems}
                                        onChange={(e) => setLimitForm({ ...limitForm, maxItems: Number(e.target.value) })}
                                        className="w-full bg-gray-700 p-2 rounded border border-gray-600 text-sm" />
                                </Field>
                                <Field label="Max Transactions / Month">
                                    <input type="number" min="1" value={limitForm.maxTransactionsPerMonth}
                                        onChange={(e) => setLimitForm({ ...limitForm, maxTransactionsPerMonth: Number(e.target.value) })}
                                        className="w-full bg-gray-700 p-2 rounded border border-gray-600 text-sm" />
                                </Field>
                                <Field label="Access Expires At">
                                    <input type="date" value={limitForm.accessExpiresAt}
                                        onChange={(e) => setLimitForm({ ...limitForm, accessExpiresAt: e.target.value })}
                                        className="w-full bg-gray-700 p-2 rounded border border-gray-600 text-sm" />
                                </Field>
                                <Field label="Grace Days">
                                    <input type="number" min="0" value={limitForm.lockoutGraceDays}
                                        onChange={(e) => setLimitForm({ ...limitForm, lockoutGraceDays: Number(e.target.value) })}
                                        className="w-full bg-gray-700 p-2 rounded border border-gray-600 text-sm" />
                                </Field>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" disabled={working}
                                    className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium disabled:opacity-50">
                                    Save
                                </button>
                                <button type="button" onClick={() => setEditingLimits(false)}
                                    className="px-4 py-2 rounded border border-gray-600 text-gray-300 text-sm hover:bg-gray-700">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <Info label="Max Users" value={t.maxUsers.toString()} />
                            <Info label="Max Items" value={t.maxItems.toString()} />
                            <Info label="Max Tx / Month" value={t.maxTransactionsPerMonth.toString()} />
                            <Info label="Access Expires" value={t.accessExpiresAt ? new Date(t.accessExpiresAt).toLocaleDateString() : 'Never'} />
                            <Info label="Grace Days" value={`${t.lockoutGraceDays} days`} />
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-sm font-medium text-white">Users ({data.users.length})</h2>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-900/60 text-gray-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Email</th>
                            <th className="px-4 py-3 text-left font-medium">Role</th>
                            <th className="px-4 py-3 text-left font-medium">Flags</th>
                            <th className="px-4 py-3 text-left font-medium">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                        {data.users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-700/30">
                                <td className="px-4 py-3 text-white">{u.email}</td>
                                <td className="px-4 py-3 text-gray-300 capitalize">{u.role}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1 flex-wrap">
                                        {u.isOwner && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-900/50 text-blue-300 border border-blue-800">
                                                OWNER
                                            </span>
                                        )}
                                        {u.isPlatformAdmin && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-900/50 text-purple-300 border border-purple-800">
                                                PLATFORM
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatCard({ label, value, limit }: { label: string; value: number; limit?: number }) {
    return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-white">
                {value}
                {limit !== undefined && <span className="text-sm text-gray-500 font-normal"> / {limit}</span>}
            </div>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
            <div className="text-sm text-gray-200 mt-0.5">{value}</div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs text-gray-400 mb-1">{label}</label>
            {children}
        </div>
    );
}

export default function TenantDetailPage() {
    return (
        <PlatformGuard>
            <PlatformShell>
                <DetailInner />
            </PlatformShell>
        </PlatformGuard>
    );
}