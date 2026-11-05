import { Module } from '@nestjs/common';
import { pgSchema, uuid, text, timestamp, bigint, date, numeric } from 'drizzle-orm/pg-core';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';
import { IdentityModule } from '@spaas/identity';
import { MasterdataModule } from '@spaas/masterdata';
import { InventoryModule } from '@spaas/inventory';
import { FinanceModule } from '@spaas/finance';

export const procurementSchema = pgSchema('procurement');

export const purchaseOrders = procurementSchema.table('purchase_order', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	vendorId: uuid('vendor_id').notNull(),
	orderDate: date('order_date').notNull(),
	status: text('status').default('open').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const purchaseOrderLines = procurementSchema.table('purchase_order_line', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	purchaseOrderId: uuid('purchase_order_id').notNull().references(() => purchaseOrders.id),
	itemId: uuid('item_id').notNull(),
	quantity: numeric('quantity').notNull(),
	unitCostMinor: bigint('unit_cost_minor', { mode: 'number' }).notNull(),
});

@Module({
	imports: [IdentityModule, MasterdataModule, InventoryModule, FinanceModule],
	controllers: [ProcurementController],
	providers: [ProcurementService],
	exports: [ProcurementService],
})
export class ProcurementModule { }