import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { AsyncLocalStorage } from 'node:async_hooks';

// 1. Connection
const client = postgres(process.env['DATABASE_URL']!, {
    ssl: 'require',
    max: 10, // Keep this low for Prisma's free tier connection pooling
});

export const db = drizzle(client);

// 2. Tenant Context
export interface TenantContext { tenantId: string; userId: string; }
export const TenantStore = new AsyncLocalStorage<TenantContext>();

// 3. The Safe Transaction Wrapper (For RLS)
export async function withTenant<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    const context = TenantStore.getStore();
    if (!context) throw new Error('No tenant context found');

    return await db.transaction(async (tx) => {
        // 'true' makes this transaction-safe for connection pooling
        await tx.execute(sql`SELECT set_config('app.current_tenant', ${context.tenantId}, true)`);
        return fn(tx);
    });
}