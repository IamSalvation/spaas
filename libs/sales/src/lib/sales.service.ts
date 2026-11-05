import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { withTenant, TenantStore } from '@spaas/shared';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { FinanceService } from '@spaas/finance';
import { salesOrders, salesOrderLines, salesInvoices } from './sales.module';

@Injectable()
export class SalesService {
    constructor(private readonly financeService: FinanceService) { }

    async createSalesOrder(customerId: string, orderDate: string, lines: { itemId: string, quantity: number, unitPrice: number }[]) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            // 1. Create the Order Header
            const [order] = await tx.insert(salesOrders).values({
                tenantId: context.tenantId,
                customerId,
                orderDate,
            }).returning();

            // 2. Insert the lines
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

    async invoiceSalesOrder(salesOrderId: string, invoiceDate: string) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        // 1. Calculate the total from the order lines
        const orderLines = await withTenant(async (tx: PostgresJsDatabase<any>) => {
            return await tx.select().from(salesOrderLines).where(eq(salesOrderLines.salesOrderId, salesOrderId));
        });

        const totalMinor = orderLines.reduce((sum, line) => sum + (line.quantity * line.unitPriceMinor), 0);
        const totalAmount = totalMinor / 100;

        // 2. Create the Invoice record
        const invoice = await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const [inv] = await tx.insert(salesInvoices).values({
                tenantId: context.tenantId,
                salesOrderId,
                invoiceDate,
                totalMinor,
            }).returning();

            // Update order status
            await tx.update(salesOrders).set({ status: 'invoiced' }).where(eq(salesOrders.id, salesOrderId));
            return inv;
        });

        // 3. THE MAGIC: Automatically post to Finance!
        // Debit Accounts Receivable (1200), Credit Sales Revenue (4000)
        await this.financeService.postJournalEntry(invoiceDate, `Invoice for SO ${salesOrderId}`, [
            { glCode: '1200', debit: totalAmount, credit: 0 },
            { glCode: '4000', debit: 0, credit: totalAmount }
        ]);

        return { success: true, invoiceId: invoice.id, totalAmount };
    }
}