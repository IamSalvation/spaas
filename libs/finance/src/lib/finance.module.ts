import { Module } from '@nestjs/common';
import { pgSchema, uuid, text, timestamp, bigint, date } from 'drizzle-orm/pg-core';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { IdentityModule } from '@spaas/identity'; // <-- ADD THIS

export const financeSchema = pgSchema('finance');

export const glAccounts = financeSchema.table('gl_account', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	code: text('code').notNull(),
	name: text('name').notNull(),
	type: text('type').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const journalEntries = financeSchema.table('journal_entry', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	entryDate: date('entry_date').notNull(),
	memo: text('memo'),
	postedAt: timestamp('posted_at', { withTimezone: true }).defaultNow().notNull(),
});

export const journalLines = financeSchema.table('journal_line', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	journalEntryId: uuid('journal_entry_id').notNull().references(() => journalEntries.id),
	glAccountId: uuid('gl_account_id').notNull().references(() => glAccounts.id),
	debitMinor: bigint('debit_minor', { mode: 'number' }).default(0).notNull(),
	creditMinor: bigint('credit_minor', { mode: 'number' }).default(0).notNull(),
});

@Module({
	imports: [IdentityModule], // <-- ADD THIS
	controllers: [FinanceController],
	providers: [FinanceService],
	exports: [FinanceService],
})
export class FinanceModule { }