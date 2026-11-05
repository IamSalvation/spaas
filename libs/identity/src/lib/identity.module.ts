import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { pgSchema, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';

export const identitySchema = pgSchema('identity');

export const tenants = identitySchema.table('tenant', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const users = identitySchema.table('user', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
	email: text('email').notNull(),
	passwordHash: text('password_hash').notNull(),
	role: text('role').default('admin').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

@Module({
	imports: [
		JwtModule.register({
			secret: process.env['JWT_SECRET'] || 'fallback-secret',
			signOptions: { expiresIn: '1d' },
		}),
	],
	controllers: [IdentityController],
	providers: [IdentityService],
	exports: [IdentityService, JwtModule], // <-- ADD JwtModule HERE
})
export class IdentityModule { }