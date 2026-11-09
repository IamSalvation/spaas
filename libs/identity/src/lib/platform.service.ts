import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { db } from '@spaas/shared';
import { tenants, users } from './identity.module';
import { eq, sql as drizzleSql } from 'drizzle-orm';

@Injectable()
export class PlatformService {
  private checkPlatformAdmin(user: any) {
    if (!user || !user.isPlatformAdmin) {
      throw new UnauthorizedException('Access denied. Platform admin only.');
    }
  }

  async getPlatformStats(requester: any) {
    this.checkPlatformAdmin(requester);

    const rows = await db.execute(drizzleSql`
      SELECT
        (SELECT count(*)::int FROM identity.tenant) as total_tenants,
        (SELECT count(*)::int FROM identity.tenant WHERE status = 'active') as active_tenants,
        (SELECT count(*)::int FROM identity.tenant WHERE status = 'pending') as pending_tenants,
        (SELECT count(*)::int FROM identity.tenant WHERE status = 'paused') as paused_tenants,
        (SELECT count(*)::int FROM identity.tenant WHERE status = 'deleted') as deleted_tenants,
        (SELECT count(*)::int FROM identity.user) as total_users,
        (SELECT count(*)::int FROM masterdata.item) as total_items,
        (SELECT count(*)::int FROM sales.sales_order) as total_sales_orders,
        (SELECT COALESCE(SUM(jl.credit_minor), 0)::bigint 
          FROM finance.journal_line jl 
          JOIN finance.gl_account gl ON gl.id = jl.gl_account_id 
          WHERE gl.code = '4000') as platform_revenue_minor,
        (SELECT count(*)::int FROM identity.tenant WHERE created_at >= NOW() - INTERVAL '7 days') as new_signups_7d,
        (SELECT count(*)::int FROM identity.tenant WHERE status = 'active' AND tier = 'v1') as tier_v1_count,
        (SELECT count(*)::int FROM identity.tenant WHERE status = 'active' AND tier = 'v2') as tier_v2_count,
        (SELECT count(*)::int FROM identity.tenant WHERE status = 'active' AND tier = 'v3') as tier_v3_count
    `);

    const stats = rows[0];
    const v1 = Number(stats['tier_v1_count']);
    const v2 = Number(stats['tier_v2_count']);
    const v3 = Number(stats['tier_v3_count']);
    const mrr = v1 * 49 + v2 * 99 + v3 * 199;

    return {
      ...stats,
      mrr_cents: mrr * 100,
    };
  }

  async listAllTenants(requester: any) {
    this.checkPlatformAdmin(requester);

    const rows = await db.execute(drizzleSql`
      SELECT 
        t.id, t.name, t.slug, t.status, t.tier,
        t.max_users, t.max_items, t.max_transactions_per_month,
        t.access_expires_at, t.lockout_grace_days, t.created_at,
        (SELECT count(*)::int FROM identity.user u WHERE u.tenant_id = t.id) as user_count,
        (SELECT count(*)::int FROM masterdata.item i WHERE i.tenant_id = t.id) as item_count,
        (SELECT count(*)::int FROM sales.sales_order so WHERE so.tenant_id = t.id) as sales_count,
        (SELECT COALESCE(SUM(jl.credit_minor), 0)::bigint 
          FROM finance.journal_line jl 
          JOIN finance.gl_account gl ON gl.id = jl.gl_account_id 
          WHERE gl.tenant_id = t.id AND gl.code = '4000') as revenue_minor
      FROM identity.tenant t
      ORDER BY t.created_at DESC
    `);

    return rows;
  }

  async getTenantDetail(requester: any, tenantId: string) {
    this.checkPlatformAdmin(requester);

    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    if (!tenant) throw new NotFoundException('Tenant not found');

    const tenantUsers = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      isOwner: users.isOwner,
      isPlatformAdmin: users.isPlatformAdmin,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.tenantId, tenantId));

    const stats = await db.execute(drizzleSql`
      SELECT 
        (SELECT count(*)::int FROM masterdata.item WHERE tenant_id = ${tenantId}) as item_count,
        (SELECT count(*)::int FROM masterdata.party WHERE tenant_id = ${tenantId}) as party_count,
        (SELECT count(*)::int FROM sales.sales_order WHERE tenant_id = ${tenantId}) as sales_count,
        (SELECT count(*)::int FROM procurement.purchase_order WHERE tenant_id = ${tenantId}) as po_count,
        (SELECT COALESCE(SUM(jl.credit_minor), 0)::bigint 
          FROM finance.journal_line jl 
          JOIN finance.gl_account gl ON gl.id = jl.gl_account_id 
          WHERE gl.tenant_id = ${tenantId} AND gl.code = '4000') as revenue_minor
    `);

    return { tenant, users: tenantUsers, stats: stats[0] };
  }

  async updateTenantStatus(requester: any, tenantId: string, status: string) {
    this.checkPlatformAdmin(requester);
    if (!['pending', 'active', 'paused', 'deleted'].includes(status)) {
      throw new UnauthorizedException('Invalid status');
    }
    const [updated] = await db.update(tenants).set({ status }).where(eq(tenants.id, tenantId)).returning();
    return updated;
  }

  async updateTenantTier(requester: any, tenantId: string, tier: string) {
    this.checkPlatformAdmin(requester);
    if (!['v1', 'v2', 'v3'].includes(tier)) throw new UnauthorizedException('Invalid tier');
    const [updated] = await db.update(tenants).set({ tier }).where(eq(tenants.id, tenantId)).returning();
    return updated;
  }

  async updateTenantLimits(requester: any, tenantId: string, limits: any) {
    this.checkPlatformAdmin(requester);

    const updateData: any = {};
    if (limits.maxUsers !== undefined) updateData.maxUsers = Number(limits.maxUsers);
    if (limits.maxItems !== undefined) updateData.maxItems = Number(limits.maxItems);
    if (limits.maxTransactionsPerMonth !== undefined) updateData.maxTransactionsPerMonth = Number(limits.maxTransactionsPerMonth);
    if (limits.lockoutGraceDays !== undefined) updateData.lockoutGraceDays = Number(limits.lockoutGraceDays);
    if (limits.accessExpiresAt !== undefined) {
      updateData.accessExpiresAt = limits.accessExpiresAt ? new Date(limits.accessExpiresAt) : null;
    }

    const [updated] = await db.update(tenants).set(updateData).where(eq(tenants.id, tenantId)).returning();
    return updated;
  }

  async hardDeleteTenant(requester: any, tenantId: string, confirmName: string) {
    this.checkPlatformAdmin(requester);

    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    if (!tenant) throw new NotFoundException('Tenant not found');

    if (requester.tenantId === tenantId) {
      throw new UnauthorizedException('You cannot hard-delete your own tenant.');
    }

    if (confirmName !== tenant.name) {
      throw new UnauthorizedException(`Name does not match. Expected "${tenant.name}".`);
    }

    await db.transaction(async (tx) => {
      // Set tenant context so RLS-enabled tables let the DELETEs through.
      await tx.execute(drizzleSql`SELECT set_config('app.current_tenant', ${tenantId}, true)`);

      // ---------------- FINANCE ----------------
      // Delete journal lines through their parents (gl_account or journal_entry).
      // This handles the case where journal_line rows have a stale/mismatched tenant_id.
      await tx.execute(drizzleSql`
        DELETE FROM finance.journal_line
        WHERE gl_account_id IN (SELECT id FROM finance.gl_account WHERE tenant_id = ${tenantId})
           OR journal_entry_id IN (SELECT id FROM finance.journal_entry WHERE tenant_id = ${tenantId})
      `);
      await tx.execute(drizzleSql`DELETE FROM finance.journal_entry WHERE tenant_id = ${tenantId}`);
      await tx.execute(drizzleSql`DELETE FROM finance.gl_account WHERE tenant_id = ${tenantId}`);

      // ---------------- SALES ----------------
      await tx.execute(drizzleSql`
        DELETE FROM sales.sales_order_line
        WHERE sales_order_id IN (SELECT id FROM sales.sales_order WHERE tenant_id = ${tenantId})
      `);
      await tx.execute(drizzleSql`DELETE FROM sales.sales_invoice WHERE tenant_id = ${tenantId}`);
      await tx.execute(drizzleSql`DELETE FROM sales.sales_order WHERE tenant_id = ${tenantId}`);

      // ---------------- PROCUREMENT ----------------
      await tx.execute(drizzleSql`
        DELETE FROM procurement.purchase_order_line
        WHERE purchase_order_id IN (SELECT id FROM procurement.purchase_order WHERE tenant_id = ${tenantId})
      `);
      await tx.execute(drizzleSql`DELETE FROM procurement.purchase_order WHERE tenant_id = ${tenantId}`);

      // ---------------- MANUFACTURING ----------------
      await tx.execute(drizzleSql`DELETE FROM manufacturing.production_order WHERE tenant_id = ${tenantId}`);
      await tx.execute(drizzleSql`DELETE FROM manufacturing.bom WHERE tenant_id = ${tenantId}`);

      // ---------------- INVENTORY ----------------
      await tx.execute(drizzleSql`DELETE FROM inventory.stock_movement WHERE tenant_id = ${tenantId}`);
      await tx.execute(drizzleSql`DELETE FROM inventory.stock_level WHERE tenant_id = ${tenantId}`);

      // ---------------- MASTERDATA ----------------
      await tx.execute(drizzleSql`DELETE FROM masterdata.item WHERE tenant_id = ${tenantId}`);
      await tx.execute(drizzleSql`DELETE FROM masterdata.party WHERE tenant_id = ${tenantId}`);

      // ---------------- COMPLIANCE ----------------
      await tx.execute(drizzleSql`DELETE FROM compliance.audit_log WHERE tenant_id = ${tenantId}`);

      // ---------------- IDENTITY ----------------
      await tx.execute(drizzleSql`DELETE FROM identity.user WHERE tenant_id = ${tenantId}`);
      await tx.execute(drizzleSql`DELETE FROM identity.tenant WHERE id = ${tenantId}`);
    });

    return { success: true, deletedTenantId: tenantId, name: tenant.name };
  }
}