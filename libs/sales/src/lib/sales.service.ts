import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { withTenant, TenantStore } from '@spaas/shared';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';
import { FinanceService } from '@spaas/finance';
import { salesOrders, salesOrderLines, salesInvoices } from './sales.module';

@Injectable()
export class SalesService {
    constructor(private readonly financeService: FinanceService) { }

    async createSalesOrder(customerId: string, orderDate: string, lines: { itemId: string, quantity: number, unitPrice: number }[]) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const [order] = await tx.insert(salesOrders).values({
                tenantId: context.tenantId,
                customerId,
                orderDate,
            }).returning();

            for (const line of lines) {
                await tx.insert(salesOrderLines).values({
                    tenantId: context.tenantId,
                    salesOrderId: order.id,
                    itemId: line.itemId,
                    quantity: line.quantity,
                    unitPriceMinor: Math.round(line.unitPrice * 100),
                });
            }

            return order;
        });
    }

    async getSalesOrders() {
        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const orders = await tx.execute(sql`
        SELECT so.id, so.order_date, so.status, p.name as customer_name 
        FROM sales.sales_order so
        JOIN masterdata.party p ON p.id = so.customer_id
        ORDER BY so.created_at DESC LIMIT 20
      `);
            return orders;
        });
    }

    async invoiceSalesOrder(salesOrderId: string, invoiceDate: string) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        const orderLines = await withTenant(async (tx: PostgresJsDatabase<any>) => {
            return await tx.select().from(salesOrderLines).where(eq(salesOrderLines.salesOrderId, salesOrderId));
        });

        const totalMinor = orderLines.reduce((sum, line) => sum + (line.quantity * line.unitPriceMinor), 0);
        const totalAmount = totalMinor / 100;

        const invoice = await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const [inv] = await tx.insert(salesInvoices).values({
                tenantId: context.tenantId,
                salesOrderId,
                invoiceDate,
                totalMinor,
            }).returning();

            await tx.update(salesOrders).set({ status: 'invoiced' }).where(eq(salesOrders.id, salesOrderId));
            return inv;
        });

        await this.financeService.postJournalEntry(invoiceDate, `Invoice for SO ${salesOrderId}`, [
            { glCode: '1200', debit: totalAmount, credit: 0 },
            { glCode: '4000', debit: 0, credit: totalAmount }
        ]);

        return { success: true, invoiceId: invoice.id, totalAmount };
    }
}