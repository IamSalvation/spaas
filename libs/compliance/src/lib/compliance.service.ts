import { Injectable } from '@nestjs/common';
import { withTenant, TenantStore } from '@spaas/shared';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { auditLogs } from './compliance.module';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class ComplianceService {
    async getLogs() {
        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            return await tx.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
        });
    }
}