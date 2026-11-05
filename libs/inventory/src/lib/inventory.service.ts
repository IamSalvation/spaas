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
            // 1. Record the movement
            await tx.insert(stockMovements).values({
                tenantId: context.tenantId,
                itemId,
                movementType: 'receipt',
                quantity: quantity.toString(),
                unitCostMinor,
                referenceId
            });

            // 2. Get existing stock level
            const [existing] = await tx.select().from(stockLevels).where(
                and(eq(stockLevels.tenantId, context.tenantId), eq(stockLevels.itemId, itemId))
            );

            if (existing) {
                // 3. Calculate Weighted Average Cost
                const currentQty = Number(existing.quantityOnHand);
                const currentValue = existing.totalValueMinor;
                const newQty = currentQty + quantity;
                const newValue = currentValue + (quantity * unitCostMinor);

                await tx.update(stockLevels)
                    .set({
                        quantityOnHand: newQty.toString(),
                        totalValueMinor: newValue
                    })
                    .where(eq(stockLevels.id, existing.id));

                return { ...existing, quantityOnHand: newQty.toString(), totalValueMinor: newValue };
            } else {
                // 4. Create new stock level
                const [newLevel] = await tx.insert(stockLevels).values({
                    tenantId: context.tenantId,
                    itemId,
                    quantityOnHand: quantity.toString(),
                    totalValueMinor: quantity * unitCostMinor
                }).returning();
                return newLevel;
            }
        });
    }

    async getStockLevel(itemId: string) {
        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const [level] = await tx.select().from(stockLevels).where(eq(stockLevels.itemId, itemId));
            return level || { quantityOnHand: '0', totalValueMinor: 0 };
        });
    }
}