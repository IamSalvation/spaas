import { Injectable, BadRequestException } from '@nestjs/common';
import { withTenant, TenantStore } from '@spaas/shared';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import { stockLevels, stockMovements } from './inventory.module';

@Injectable()
export class InventoryService {

    async receiveStock(itemId: string, quantity: number, unitCost: number, referenceId?: string) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        const unitCostMinor = Math.round(unitCost * 100);

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            await tx.insert(stockMovements).values({
                tenantId: context.tenantId, itemId, movementType: 'receipt',
                quantity: quantity.toString(), unitCostMinor, referenceId
            });

            const [existing] = await tx.select().from(stockLevels).where(
                and(eq(stockLevels.tenantId, context.tenantId), eq(stockLevels.itemId, itemId))
            );

            if (existing) {
                const currentQty = Number(existing.quantityOnHand);
                const currentValue = existing.totalValueMinor;
                const newQty = currentQty + quantity;
                const newValue = currentValue + (quantity * unitCostMinor);

                await tx.update(stockLevels)
                    .set({ quantityOnHand: newQty.toString(), totalValueMinor: newValue })
                    .where(and(eq(stockLevels.id, existing.id), eq(stockLevels.tenantId, context.tenantId)));

                return { ...existing, quantityOnHand: newQty.toString(), totalValueMinor: newValue };
            } else {
                const [newLevel] = await tx.insert(stockLevels).values({
                    tenantId: context.tenantId, itemId,
                    quantityOnHand: quantity.toString(), totalValueMinor: quantity * unitCostMinor
                }).returning();
                return newLevel;
            }
        });
    }

    async issueStock(itemId: string, quantity: number, referenceId?: string) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const [existing] = await tx.select().from(stockLevels).where(
                and(eq(stockLevels.tenantId, context.tenantId), eq(stockLevels.itemId, itemId))
            );

            if (!existing || Number(existing.quantityOnHand) < quantity) {
                throw new BadRequestException(`Insufficient stock for item ${itemId}`);
            }

            const currentQty = Number(existing.quantityOnHand);
            const currentValue = existing.totalValueMinor;
            const avgUnitCostMinor = currentValue / currentQty;

            const newQty = currentQty - quantity;
            const newValue = currentValue - (quantity * avgUnitCostMinor);

            await tx.update(stockLevels)
                .set({ quantityOnHand: newQty.toString(), totalValueMinor: Math.round(newValue) })
                .where(and(eq(stockLevels.id, existing.id), eq(stockLevels.tenantId, context.tenantId)));

            await tx.insert(stockMovements).values({
                tenantId: context.tenantId, itemId, movementType: 'issue',
                quantity: quantity.toString(), unitCostMinor: Math.round(avgUnitCostMinor), referenceId
            });

            return { valueIssuedMinor: Math.round(quantity * avgUnitCostMinor) };
        });
    }

    async getStockLevel(itemId: string) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const [level] = await tx.select().from(stockLevels).where(
                and(eq(stockLevels.tenantId, context.tenantId), eq(stockLevels.itemId, itemId))
            );
            return level || { quantityOnHand: '0', totalValueMinor: 0 };
        });
    }
}