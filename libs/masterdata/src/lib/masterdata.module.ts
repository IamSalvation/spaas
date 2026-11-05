import { Module } from '@nestjs/common';
import { pgSchema, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { MasterdataService } from './masterdata.service';
import { MasterdataController } from './masterdata.controller';
import { IdentityModule } from '@spaas/identity';

export const masterdataSchema = pgSchema('masterdata');

export const parties = masterdataSchema.table('party', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	type: text('type').notNull(),
	name: text('name').notNull(),
	email: text('email'),
	phone: text('phone'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const items = masterdataSchema.table('item', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	sku: text('sku').notNull(),
	name: text('name').notNull(),
	uom: text('uom').default('EA').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

@Module({
	imports: [IdentityModule],
	controllers: [MasterdataController],
	providers: [MasterdataService],
	exports: [MasterdataService],
})
export class MasterdataModule { }