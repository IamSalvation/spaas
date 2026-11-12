'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlatformGuard } from '../../components/PlatformGuard';
import { PlatformShell } from '../../components/PlatformShell';
import { api } from '../../lib/api';

interface PlatformStats {
  total_tenants: number;
  active_tenants: number;
  pending_tenants: number;
  paused_tenants: number;
  deleted_tenants: number;
  total_users: number;
  total_items: number;
  total_sales_orders: number;
  platform_revenue_minor: string;
  new_signups_7d: number;
  mrr_cents: number;
}

function HomeInner() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/platform/stats');
        setStats(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8 text-gray-500 dark:text-gray-400">Loading platform stats...</div>;
  if (error) return <div className="p-8 text-red-600 dark:text-red-400">{error}</div>;
  if (!stats) return null;

  const revenue = (Number(stats.platform_revenue_minor) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const mrr = (stats.mrr_cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Platform Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage all tenants on SPAAS.
        </p>
      </div>

      {/* Main stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link
          href="/platform/tenants"
          className="bg-white dark:bg-spaas-surface rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:border-spaas-blue transition group shadow-sm"
        >
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Total Tenants</div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-spaas-blue transition">
            {stats.total_tenants}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {stats.active_tenants > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                {stats.active_tenants} active
              </span>
            )}
            {stats.pending_tenants > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium border border-amber-500/20">
                {stats.pending_tenants} pending
              </span>
            )}
          </div>
        </Link>

        <div className="bg-white dark:bg-spaas-surface rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Monthly Recurring Revenue</div>
          <div className="text-4xl font-bold text-spaas-blue">${mrr}</div>
          <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
              V1 × {stats.total_tenants > 0 ? '' : ''}{Math.round(stats.mrr_cents / 100 / 49) || 0}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-spaas-surface rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Platform-Wide Revenue</div>
          <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">${revenue}</div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Across all tenants · Sales-based
          </div>
        </div>

        <div className="bg-white dark:bg-spaas-surface rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">New Signups (7 days)</div>
          <div className="text-4xl font-bold text-spaas-blue">{stats.new_signups_7d}</div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Tenants created this week
          </div>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-spaas-surface rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Total Users</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_users}</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Across all tenants</div>
        </div>
        <div className="bg-white dark:bg-spaas-surface rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Total Items</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_items}</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Master data records</div>
        </div>
        <div className="bg-white dark:bg-spaas-surface rounded-lg p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Total Sales Orders</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_sales_orders}</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Orders processed</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/platform/tenants"
            className="bg-white dark:bg-spaas-surface rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-spaas-blue transition flex items-center justify-between group shadow-sm"
          >
            <div>
              <div className="font-medium text-gray-900 dark:text-white group-hover:text-spaas-blue transition">
                View All Tenants
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Manage subscriptions, limits, and status
              </div>
            </div>
            {/* FIXED ARROW SYMBOL */}
            <div className="text-gray-400 group-hover:text-spaas-blue transition text-2xl">
              &rarr;
            </div>
          </Link>
          <Link
            href="/dashboard"
            className="bg-white dark:bg-spaas-surface rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-spaas-blue transition flex items-center justify-between group shadow-sm"
          >
            <div>
              <div className="font-medium text-gray-900 dark:text-white group-hover:text-spaas-blue transition">
                Enter My Tenant Dashboard
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use SPAAS as a normal user
              </div>
            </div>
            {/* FIXED ARROW SYMBOL */}
            <div className="text-gray-400 group-hover:text-spaas-blue transition text-2xl">
              &rarr;
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PlatformHomePage() {
  return (
    <PlatformGuard>
      <PlatformShell>
        <HomeInner />
      </PlatformShell>
    </PlatformGuard>
  );
}