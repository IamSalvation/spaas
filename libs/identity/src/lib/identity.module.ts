import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { pgSchema, uuid, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { PlatformService } from './platform.service';
import { PlatformController } from './platform.controller';

export const identitySchema = pgSchema('identity');

export const tenants = identitySchema.table('tenant', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	slug: text('slug'),
	status: text('status').default('active').notNull(),
	tier: text('tier').default('v1').notNull(),
	maxUsers: integer('max_users').default(5).notNull(),
	maxItems: integer('max_items').default(100).notNull(),
	maxTransactionsPerMonth: integer('max_transactions_per_month').default(1000).notNull(),
	accessExpiresAt: timestamp('access_expires_at', { withTimezone: true }),
	lockoutGraceDays: integer('lockout_grace_days').default(7).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const users = identitySchema.table('user', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
	email: text('email').notNull(),
	passwordHash: text('password_hash').notNull(),
	role: text('role').default('admin').notNull(),
	isOwner: boolean('is_owner').default(false).notNull(),
	isPlatformAdmin: boolean('is_platform_admin').default(false).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

@Module({
	imports: [
		JwtModule.register({
			secret: process.env['JWT_SECRET'] || 'fallback-secret',
			signOptions: { expiresIn: '1d' },
		}),
	],
	controllers: [IdentityController, PlatformController],
	providers: [IdentityService, PlatformService],
	exports: [IdentityService, PlatformService, JwtModule],
})
export class IdentityModule { }