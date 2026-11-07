import { Module } from '@nestjs/common';
import { pgSchema, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { IdentityModule } from '@spaas/identity';

export const complianceSchema = pgSchema('compliance');

export const auditLogs = complianceSchema.table('audit_log', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	userEmail: text('user_email'),
	action: text('action').notNull(),
	resource: text('resource').notNull(),
	payload: jsonb('payload'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

@Module({
	imports: [IdentityModule],
	controllers: [ComplianceController],
	providers: [ComplianceService],
	exports: [ComplianceService], // <-- Removed auditLogs from here
})
export class ComplianceModule { }