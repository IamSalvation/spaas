import { Injectable, BadRequestException } from '@nestjs/common';
import { withTenant, TenantStore } from '@spaas/shared';
import { parties, items } from './masterdata.module';
import { eq, and } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class MasterdataService {

    async createParty(type: string, name: string, email?: string, phone?: string) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        if (type !== 'customer' && type !== 'vendor') {
            throw new BadRequestException('Party type must be customer or vendor');
        }

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const [party] = await tx.insert(parties).values({
                tenantId: context.tenantId,
                type,
                name,
                email,
                phone
            }).returning();
            return party;
        });
    }

    async createItem(sku: string, name: string, uom: string) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const [item] = await tx.insert(items).values({
                tenantId: context.tenantId,
                sku,
                name,
                uom
            }).returning();
            return item;
        });
    }

    async getParties() {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            return await tx.select().from(parties).where(eq(parties.tenantId, context.tenantId));
        });
    }

    async getItems() {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            return await tx.select().from(items).where(eq(items.tenantId, context.tenantId));
        });
    }
}