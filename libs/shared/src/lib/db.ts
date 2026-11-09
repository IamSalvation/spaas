
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { AsyncLocalStorage } from 'node:async_hooks';

// ============================================================
// 1. DATABASE CONNECTION
// ============================================================

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not configured');
}

const client = postgres(databaseUrl, {
    ssl: 'require',
    max: 10,
});

export const db = drizzle(client);

// ============================================================
// 2. TENANT CONTEXT
// ============================================================

export interface TenantContext {
    tenantId: string;
    userId: string;
}

export const TenantStore = new AsyncLocalStorage<TenantContext>();

// ============================================================
// 3. TENANT-AWARE TRANSACTION WRAPPER
// ============================================================

export async function withTenant<T>(
    fn: (tx: any) => Promise<T>
): Promise<T> {
    const context = TenantStore.getStore();

    if (!context) {
        throw new Error('No tenant context found');
    }

    if (!context.tenantId) {
        throw new Error('Tenant ID is missing from tenant context');
    }

    return await db.transaction(async (tx) => {

        // Set tenant context for this transaction only.
        // This setting is automatically reset when the transaction ends.
        await tx.execute(sql`
            SELECT set_config(
                'app.current_tenant',
                ${context.tenantId},
                true
            )
        `);

        // TEMPORARY SECURITY DIAGNOSTIC:
        // Verify the actual database role and tenant context
        // used by the live API transaction.
        const identity = await tx.execute(sql`
            SELECT
                current_user,
                session_user,
                current_setting(
                    'app.current_tenant',
                    true
                ) AS tenant_id
        `);

        console.log(
            '[SPAAS RLS DIAGNOSTIC]',
            JSON.stringify(identity)
        );

        // IMPORTANT:
        // All tenant-protected database queries inside this callback
        // must use the supplied transaction object (tx).
        return await fn(tx);
    });
}
