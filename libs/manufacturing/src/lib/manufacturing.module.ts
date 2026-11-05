import { Module } from '@nestjs/common';
import { pgSchema, uuid, text, timestamp, numeric, date } from 'drizzle-orm/pg-core';
import { ManufacturingService } from './manufacturing.service';
import { ManufacturingController } from './manufacturing.controller';
import { IdentityModule } from '@spaas/identity';
import { InventoryModule } from '@spaas/inventory';
import { FinanceModule } from '@spaas/finance';

export const manufacturingSchema = pgSchema('manufacturing');

export const boms = manufacturingSchema.table('bom', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	productItemId: uuid('product_item_id').notNull(),
	componentItemId: uuid('component_item_id').notNull(),
	quantityRequired: numeric('quantity_required').notNull(),
});

export const productionOrders = manufacturingSchema.table('production_order', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	productItemId: uuid('product_item_id').notNull(),
	targetQuantity: numeric('target_quantity').notNull(),
	status: text('status').default('planned').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

@Module({
	imports: [IdentityModule, InventoryModule, FinanceModule],
	controllers: [ManufacturingController],
	providers: [ManufacturingService],
	exports: [ManufacturingService],
})
export class ManufacturingModule { }