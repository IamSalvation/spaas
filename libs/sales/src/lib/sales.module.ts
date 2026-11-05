import { Module } from '@nestjs/common';
import { pgSchema, uuid, text, timestamp, integer, bigint, date } from 'drizzle-orm/pg-core';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { IdentityModule } from '@spaas/identity';
import { FinanceModule } from '@spaas/finance';
import { MasterdataModule } from '@spaas/masterdata';

export const salesSchema = pgSchema('sales');

export const salesOrders = salesSchema.table('sales_order', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	customerId: uuid('customer_id').notNull(),
	orderDate: date('order_date').notNull(),
	status: text('status').default('open').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const salesOrderLines = salesSchema.table('sales_order_line', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	salesOrderId: uuid('sales_order_id').notNull().references(() => salesOrders.id),
	itemId: uuid('item_id').notNull(),
	quantity: integer('quantity').notNull(),
	unitPriceMinor: bigint('unit_price_minor', { mode: 'number' }).notNull(),
});

export const salesInvoices = salesSchema.table('sales_invoice', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	salesOrderId: uuid('sales_order_id').notNull().references(() => salesOrders.id),
	invoiceDate: date('invoice_date').notNull(),
	totalMinor: bigint('total_minor', { mode: 'number' }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

@Module({
	imports: [IdentityModule, FinanceModule, MasterdataModule],
	controllers: [SalesController],
	providers: [SalesService],
	exports: [SalesService],
})
export class SalesModule { }