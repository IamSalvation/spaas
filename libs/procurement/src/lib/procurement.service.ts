import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { withTenant, TenantStore } from '@spaas/shared';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { InventoryService } from '@spaas/inventory';
import { FinanceService } from '@spaas/finance';
import { purchaseOrders, purchaseOrderLines } from './procurement.module';

@Injectable()
export class ProcurementService {
    constructor(
        private readonly inventoryService: InventoryService,
        private readonly financeService: FinanceService
    ) { }

    async createPurchaseOrder(vendorId: string, orderDate: string, lines: { itemId: string, quantity: number, unitCost: number }[]) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const [order] = await tx.insert(purchaseOrders).values({
                tenantId: context.tenantId,
                vendorId,
                orderDate,
            }).returning();

            for (const line of lines) {
                await tx.insert(purchaseOrderLines).values({
                    tenantId: context.tenantId,
                    purchaseOrderId: order.id,
                    itemId: line.itemId,
                    quantity: line.quantity.toString(),
                    unitCostMinor: Math.round(line.unitCost * 100),
                });
            }

            return order;
        });
    }

    async receivePurchaseOrder(purchaseOrderId: string) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        // 1. Get the order and lines
        const orderLines = await withTenant(async (tx: PostgresJsDatabase<any>) => {
            return await tx.select().from(purchaseOrderLines).where(eq(purchaseOrderLines.purchaseOrderId, purchaseOrderId));
        });

        if (orderLines.length === 0) throw new NotFoundException('Purchase Order has no lines');

        // 2. Update PO status to 'received'
        await withTenant(async (tx: PostgresJsDatabase<any>) => {
            await tx.update(purchaseOrders).set({ status: 'received' }).where(eq(purchaseOrders.id, purchaseOrderId));
        });

        let totalAmount = 0;

        // 3. For each line, receive it into Inventory and calculate the total
        for (const line of orderLines) {
            const qty = Number(line.quantity);
            const unitCost = line.unitCostMinor / 100;
            const lineTotal = qty * unitCost;
            totalAmount += lineTotal;

            // This automatically updates the stock_level table (WAC logic)
            await this.inventoryService.receiveStock(line.itemId, qty, unitCost, purchaseOrderId);
        }

        // 4. Post to Finance (Debit Inventory 1300, Credit Accounts Payable 2000)
        // Note: You must make sure GL Accounts 1300 and 2000 exist in the DB!
        await this.financeService.postJournalEntry(new Date().toISOString().split('T')[0], `Received PO ${purchaseOrderId}`, [
            { glCode: '1300', debit: totalAmount, credit: 0 }, // Debit Inventory
            { glCode: '2000', debit: 0, credit: totalAmount }  // Credit Accounts Payable
        ]);

        return { success: true, purchaseOrderId, totalAmount };
    }
}