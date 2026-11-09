import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { withTenant, TenantStore } from '@spaas/shared';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, sql } from 'drizzle-orm';
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

    async getPurchaseOrders() {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const orders = await tx.execute(sql`
        SELECT po.id, po.order_date, po.status, p.name as vendor_name 
        FROM procurement.purchase_order po
        JOIN masterdata.party p ON p.id = po.vendor_id
        WHERE po.tenant_id = ${context.tenantId}
          AND p.tenant_id = ${context.tenantId}
        ORDER BY po.created_at DESC LIMIT 20
      `);
            return orders;
        });
    }

    async receivePurchaseOrder(purchaseOrderId: string) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        const orderLines = await withTenant(async (tx: PostgresJsDatabase<any>) => {
            return await tx.select().from(purchaseOrderLines)
                .where(and(
                    eq(purchaseOrderLines.purchaseOrderId, purchaseOrderId),
                    eq(purchaseOrderLines.tenantId, context.tenantId)
                ));
        });

        if (orderLines.length === 0) throw new NotFoundException('Purchase Order not found');

        await withTenant(async (tx: PostgresJsDatabase<any>) => {
            await tx.update(purchaseOrders).set({ status: 'received' })
                .where(and(eq(purchaseOrders.id, purchaseOrderId), eq(purchaseOrders.tenantId, context.tenantId)));
        });

        let totalAmount = 0;

        for (const line of orderLines) {
            const qty = Number(line.quantity);
            const unitCost = line.unitCostMinor / 100;
            const lineTotal = qty * unitCost;
            totalAmount += lineTotal;

            await this.inventoryService.receiveStock(line.itemId, qty, unitCost, purchaseOrderId);
        }

        await this.financeService.postJournalEntry(new Date().toISOString().split('T')[0], `Received PO ${purchaseOrderId}`, [
            { glCode: '1300', debit: totalAmount, credit: 0 },
            { glCode: '2000', debit: 0, credit: totalAmount }
        ]);

        return { success: true, purchaseOrderId, totalAmount };
    }
}