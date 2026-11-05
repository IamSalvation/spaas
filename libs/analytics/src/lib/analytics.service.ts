import { Injectable } from '@nestjs/common';
import { withTenant, TenantStore } from '@spaas/shared';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';

@Injectable()
export class AnalyticsService {
    async getDashboardStats() {
        const context = TenantStore.getStore();
        if (!context) throw new Error('No tenant context');

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            // 1. Count Items
            const itemsResult = await tx.execute(sql`SELECT count(*) as count FROM masterdata.item`);
            const totalItems = Number(itemsResult[0]['count']);

            // 2. Count Customers
            const customersResult = await tx.execute(sql`SELECT count(*) as count FROM masterdata.party WHERE type = 'customer'`);
            const activeCustomers = Number(customersResult[0]['count']);

            // 3. Calculate Total Revenue (Sum of credits to revenue account 4000)
            const revenueResult = await tx.execute(sql`
        SELECT SUM(credit_minor) as total 
        FROM finance.journal_line 
        JOIN finance.gl_account ON finance.gl_account.id = finance.journal_line.gl_account_id
        WHERE finance.gl_account.code = '4000'
      `);
            const totalRevenueMinor = Number(revenueResult[0]?.['total'] || 0);
            const totalRevenue = totalRevenueMinor / 100; // Convert to dollars

            return {
                totalItems,
                activeCustomers,
                totalRevenue,
            };
        });
    }
}