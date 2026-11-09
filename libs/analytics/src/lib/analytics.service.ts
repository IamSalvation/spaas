import { Injectable, BadRequestException } from '@nestjs/common';
import { withTenant, TenantStore } from '@spaas/shared';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';

@Injectable()
export class AnalyticsService {
    async getDashboardStats() {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');
        const tenantId = context.tenantId;

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            // 1. Count items — filtered by tenant
            const itemsResult = await tx.execute(sql`
        SELECT count(*)::int AS count 
        FROM masterdata.item 
        WHERE tenant_id = ${tenantId}
      `);
            const totalItems = Number(itemsResult[0]['count']);

            // 2. Count customers — filtered by tenant
            const customersResult = await tx.execute(sql`
        SELECT count(*)::int AS count 
        FROM masterdata.party 
        WHERE tenant_id = ${tenantId} AND type = 'customer'
      `);
            const activeCustomers = Number(customersResult[0]['count']);

            // 3. Revenue — filtered by tenant
            const revenueResult = await tx.execute(sql`
        SELECT COALESCE(SUM(jl.credit_minor), 0)::bigint AS total 
        FROM finance.journal_line jl 
        JOIN finance.gl_account gl ON gl.id = jl.gl_account_id 
        WHERE gl.code = '4000' 
          AND gl.tenant_id = ${tenantId}
          AND jl.tenant_id = ${tenantId}
      `);
            const totalRevenueMinor = Number(revenueResult[0]?.['total'] || 0);
            const totalRevenue = totalRevenueMinor / 100;

            return {
                totalItems,
                activeCustomers,
                totalRevenue,
            };
        });
    }
}