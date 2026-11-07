import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { withTenant, TenantStore } from '@spaas/shared';
import { glAccounts, journalEntries, journalLines } from './finance.module';
import { eq, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class FinanceService {

    async createGlAccount(code: string, name: string, type: string) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const [account] = await tx.insert(glAccounts).values({
                tenantId: context.tenantId,
                code,
                name,
                type
            }).returning();
            return account;
        });
    }

    async postJournalEntry(entryDate: string, memo: string, lines: { glCode: string, debit: number, credit: number }[]) {
        const context = TenantStore.getStore();
        if (!context) throw new BadRequestException('No tenant context');

        // 1. Rule: Debits must equal Credits
        const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);

        if (totalDebit !== totalCredit) {
            throw new BadRequestException(`Unbalanced entry: Debits (${totalDebit}) != Credits (${totalCredit})`);
        }

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            // 2. Create the Journal Entry header
            const [entry] = await tx.insert(journalEntries).values({
                tenantId: context.tenantId,
                entryDate,
                memo
            }).returning();

            // 3. Insert the lines
            for (const line of lines) {
                // Find the GL Account by its code
                const [account] = await tx.select().from(glAccounts).where(eq(glAccounts.code, line.glCode));
                if (!account) throw new NotFoundException(`GL Account ${line.glCode} not found`);

                await tx.insert(journalLines).values({
                    tenantId: context.tenantId,
                    journalEntryId: entry.id,
                    glAccountId: account.id,
                    debitMinor: Math.round(line.debit * 100), // Convert to cents
                    creditMinor: Math.round(line.credit * 100),
                });
            }

            return { success: true, journalEntryId: entry.id };
        });
    }

    async getTrialBalance() {
        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const result = await tx.execute(sql`
        SELECT 
          gl.code, 
          gl.name, 
          gl.type,
          COALESCE(SUM(jl.debit_minor), 0) as total_debit,
          COALESCE(SUM(jl.credit_minor), 0) as total_credit
        FROM finance.gl_account gl
        LEFT JOIN finance.journal_line jl ON jl.gl_account_id = gl.id
        GROUP BY gl.id, gl.code, gl.name, gl.type
        ORDER BY gl.code ASC
      `);
            return result;
        });
    }
}