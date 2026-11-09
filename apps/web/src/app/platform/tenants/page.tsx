'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../components/AuthProvider';
import { PlatformGuard } from '../../../components/PlatformGuard';
import { PlatformShell } from '../../../components/PlatformShell';
import { api } from '../../../lib/api';

type StatusFilter = 'all' | 'active' | 'pending' | 'paused' | 'deleted';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  tier: string;
  user_count: number;
  item_count: number;
  sales_count: number;
  revenue_minor: string;
  created_at: string;
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
    case 'v1':
    default: return 'bg-gray-700 text-gray-300 border border-gray-600';
  }
}

function formatMoney(minorStr: string): string {
  const cents = BigInt(minorStr);
  const dollars = Number(cents) / 100;
  return '$' + dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function TenantsInner() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [working, setWorking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/platform/tenants');
      setTenants(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = statusFilter === 'all'
    ? tenants
    : tenants.filter((t) => t.status === statusFilter);

  async function updateStatus(id: string, status: string, label: string) {
    if (!confirm(label)) return;
    setWorking(id);
    try {
      await api.patch(`/platform/tenants/${id}/status`, { status });
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setWorking(null);
    }
  }

  async function toggleTier(t: Tenant) {
    const next = t.tier === 'v1' ? 'v2' : t.tier === 'v2' ? 'v3' : 'v1';
    if (!confirm(`Change ${t.name} tier from ${t.tier.toUpperCase()} to ${next.toUpperCase()}?`)) return;
    setWorking(t.id);
    try {
      await api.patch(`/platform/tenants/${t.id}/tier`, { tier: next });
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update tier');
    } finally {
      setWorking(null);
    }
  }

  const counts = {
    all: tenants.length,
    active: tenants.filter((t) => t.status === 'active').length,
    pending: tenants.filter((t) => t.status === 'pending').length,
    paused: tenants.filter((t) => t.status === 'paused').length,
    deleted: tenants.filter((t) => t.status === 'deleted').length,
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Tenants</h1>
          <p className="text-sm text-gray-400">
            {tenants.length} account{tenants.length === 1 ? '' : 's'} on the platform
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'active', 'pending', 'paused', 'deleted'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded text-xs font-medium border ${
              statusFilter === s
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-2 opacity-60">({counts[s]})</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-900/30 border border-red-800 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading tenants...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No tenants match this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900/60 text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Company</th>
                  <th className="px-4 py-3 text-left font-medium">Slug</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Tier</th>
                  <th className="px-4 py-3 text-right font-medium">Users</th>
                  <th className="px-4 py-3 text-right font-medium">Items</th>
                  <th className="px-4 py-3 text-right font-medium">Sales</th>
                  <th className="px-4 py-3 text-right font-medium">Revenue</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filtered.map((t) => {
                  const isOwn = t.id === user?.tenantId;
                  const isWorking = working === t.id;
                  return (
                    <tr key={t.id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3">
                        <Link
                          href={`/platform/tenants/${t.id}`}
                          className="font-medium text-white hover:text-purple-400 hover:underline"
                        >
                          {t.name}
                        </Link>
                        {isOwn && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-blue-900/50 text-blue-300 border border-blue-800">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{t.slug}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusClass(t.status)}`}>
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleTier(t)}
                          disabled={isWorking}
                          className={`px-2 py-0.5 rounded text-xs font-medium hover:opacity-80 disabled:opacity-50 ${tierClass(t.tier)}`}
                          title="Click to change tier"
                        >
                          {t.tier.toUpperCase()}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300">{t.user_count}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{t.item_count}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{t.sales_count}</td>
                      <td className="px-4 py-3 text-right font-mono text-green-400">
                        {formatMoney(t.revenue_minor)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-3 text-xs">
                          {t.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(t.id, 'active', `Approve ${t.name}?`)}
                              disabled={isWorking}
                              className="text-emerald-400 hover:underline disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {t.status === 'active' && !isOwn && (
                            <button
                              onClick={() => updateStatus(t.id, 'paused', `Pause ${t.name}? They will not be able to log in.`)}
                              disabled={isWorking}
                              className="text-orange-400 hover:underline disabled:opacity-50"
                            >
                              Pause
                            </button>
                          )}
                          {t.status === 'paused' && (
                            <button
                              onClick={() => updateStatus(t.id, 'active', `Restore ${t.name}?`)}
                              disabled={isWorking}
                              className="text-emerald-400 hover:underline disabled:opacity-50"
                            >
                              Restore
                            </button>
                          )}
                          {t.status !== 'deleted' && !isOwn && (
                            <button
                              onClick={() => updateStatus(t.id, 'deleted', `Soft-delete ${t.name}? Data is preserved but the account cannot log in.`)}
                              disabled={isWorking}
                              className="text-red-400 hover:underline disabled:opacity-50"
                            >
                              Delete
                            </button>
                          )}
                          {t.status === 'deleted' && (
                            <button
                              onClick={() => updateStatus(t.id, 'active', `Restore ${t.name}?`)}
                              disabled={isWorking}
                              className="text-emerald-400 hover:underline disabled:opacity-50"
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Click the tier badge to cycle v1 → v2 → v3. Paused accounts cannot log in. Deleted accounts are preserved but blocked.
      </p>
    </div>
  );
}

export default function TenantsPage() {
  return (
    <PlatformGuard>
      <PlatformShell>
        <TenantsInner />
      </PlatformShell>
    </PlatformGuard>
  );
}