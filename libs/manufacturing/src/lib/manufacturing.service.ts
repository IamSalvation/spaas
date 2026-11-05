import { Injectable, BadRequestException } from '@nestjs/common';
import { withTenant, TenantStore } from '@spaas/shared';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { InventoryService } from '@spaas/inventory';
import { FinanceService } from '@spaas/finance';
import { boms, productionOrders } from './manufacturing.module';

@Injectable()
export class ManufacturingService {
    constructor(
        private readonly inventoryService: InventoryService,
        private readonly financeService: FinanceService
    ) { }

    async createBom(productItemId: string, components: { componentItemId: string, quantity: number }[]) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            for (const comp of components) {
                await tx.insert(boms).values({
                    tenantId: context.tenantId,
                    productItemId,
                    componentItemId: comp.componentItemId,
                    quantityRequired: comp.quantity.toString(),
                });
            }
            return { success: true };
        });
    }

    async createProductionOrder(productItemId: string, targetQuantity: number) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const [order] = await tx.insert(productionOrders).values({
                tenantId: context.tenantId,
                productItemId,
                targetQuantity: targetQuantity.toString(),
            }).returning();
            return order;
        });
    }

    async completeProductionOrder(orderId: string) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        // 1. Get the Order and BOM
        const [order] = await withTenant(async (tx: PostgresJsDatabase<any>) => {
            return await tx.select().from(productionOrders).where(eq(productionOrders.id, orderId));
        });

        if (!order) throw new BadRequestException('Order not found');
        if (order.status === 'completed') throw new BadRequestException('Order already completed');

        const bomComponents = await withTenant(async (tx: PostgresJsDatabase<any>) => {
            return await tx.select().from(boms).where(eq(boms.productItemId, order.productItemId));
        });

        const targetQty = Number(order.targetQuantity);
        let totalMaterialCost = 0;

        // 2. Consume Components
        for (const comp of bomComponents) {
            const qtyRequired = Number(comp.quantityRequired) * targetQty;
            const { valueIssuedMinor } = await this.inventoryService.issueStock(comp.componentItemId, qtyRequired, orderId);
            totalMaterialCost += valueIssuedMinor;
        }

        // 3. Add Finished Goods to Inventory
        const unitCost = (totalMaterialCost / 100) / targetQty;
        await this.inventoryService.receiveStock(order.productItemId, targetQty, unitCost, orderId);

        // 4. Update order status
        await withTenant(async (tx: PostgresJsDatabase<any>) => {
            await tx.update(productionOrders).set({ status: 'completed' }).where(eq(productionOrders.id, orderId));
        });

        return { success: true, totalMaterialCost: totalMaterialCost / 100 };
    }
}