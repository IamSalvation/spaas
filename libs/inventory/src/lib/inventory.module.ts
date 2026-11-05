import { Module } from '@nestjs/common';
import { pgSchema, uuid, numeric, bigint, text, timestamp } from 'drizzle-orm/pg-core';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { IdentityModule } from '@spaas/identity';
import { MasterdataModule } from '@spaas/masterdata';

export const inventorySchema = pgSchema('inventory');

export const stockLevels = inventorySchema.table('stock_level', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	itemId: uuid('item_id').notNull(),
	locationId: uuid('location_id'),
	quantityOnHand: numeric('quantity_on_hand').notNull().default('0'),
	totalValueMinor: bigint('total_value_minor', { mode: 'number' }).notNull().default(0),
});

export const stockMovements = inventorySchema.table('stock_movement', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	itemId: uuid('item_id').notNull(),
	movementType: text('movement_type').notNull(),
	quantity: numeric('quantity').notNull(),
	unitCostMinor: bigint('unit_cost_minor', { mode: 'number' }).notNull(),
	referenceId: uuid('reference_id'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

@Module({
	imports: [IdentityModule, MasterdataModule],
	controllers: [InventoryController],
	providers: [InventoryService],
	exports: [InventoryService],
})
export class InventoryModule { }