import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { db, withTenant, TenantStore } from '@spaas/shared';
import { tenants, users } from './identity.module';
import { eq, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { EmailService } from './email.service';

@Injectable()
export class IdentityService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
    ) { }

    async registerCompany(companyName: string, email: string, pass: string) {
        const passwordHash = await bcrypt.hash(pass, 10);

        const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        let slug = baseSlug;
        let counter = 1;
        while (true) {
            const existing = await db.execute(sql`SELECT id FROM identity.tenant WHERE slug = ${slug}`);
            if (existing.length === 0) break;
            slug = `${baseSlug}-${counter++}`;
        }

        const [tenant] = await db.insert(tenants).values({
            name: companyName,
            slug,
            status: 'active',
            tier: 'v1',
        }).returning();

        const user = await TenantStore.run({ tenantId: tenant.id, userId: 'system' }, async () => {
            return await withTenant(async (tx: PostgresJsDatabase<any>) => {
                const [newUser] = await tx.insert(users).values({
                    tenantId: tenant.id,
                    email,
                    passwordHash,
                    role: 'admin',
                    isOwner: true,
                    isPlatformAdmin: false,
                }).returning();
                return newUser;
            });
        });

        // Fire off emails in the background (don't block the registration response)
        void this.emailService.sendWelcomeEmail({
            to: email,
            companyName,
            slug,
            loginEmail: email,
        });
        void this.emailService.sendNewSignupAlert({
            companyName,
            slug,
            ownerEmail: email,
            tenantId: tenant.id,
        });

        return this.generateToken(user);
    }

    async login(email: string, pass: string, identifier: string) {
        const tenantLookup = await db.execute(sql`
      SELECT id, status FROM identity.tenant
      WHERE slug = ${identifier} OR id::text = ${identifier}
      LIMIT 1
    `);

        if (tenantLookup.length === 0) {
            throw new UnauthorizedException('Company workspace not found');
        }

        const tenantId = tenantLookup[0]['id'] as string;
        const tenantStatus = tenantLookup[0]['status'] as string;

        if (tenantStatus === 'paused') {
            throw new UnauthorizedException('This account has been paused. Please contact support.');
        }
        if (tenantStatus === 'deleted') {
            throw new UnauthorizedException('This account has been deleted.');
        }

        const user = await TenantStore.run({ tenantId, userId: 'system' }, async () => {
            return await withTenant(async (tx: PostgresJsDatabase<any>) => {
                const results = await tx.select().from(users).where(eq(users.email, email));
                return results[0];
            });
        });

        if (!user) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(pass, user.passwordHash);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        return this.generateToken(user);
    }

    async createUser(email: string, pass: string, role: string) {
        const context = TenantStore.getStore();
        if (!context) throw new UnauthorizedException('No tenant context');

        const passwordHash = await bcrypt.hash(pass, 10);

        return await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const [newUser] = await tx.insert(users).values({
                tenantId: context.tenantId,
                email,
                passwordHash,
                role,
                isOwner: false,
                isPlatformAdmin: false,
            }).returning();

            const { passwordHash: _, ...result } = newUser;
            return result;
        });
    }

    private generateToken(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId,
            role: user.role,
            isPlatformAdmin: user.isPlatformAdmin,
            isOwner: user.isOwner,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                tenantId: user.tenantId,
                role: user.role,
                isPlatformAdmin: user.isPlatformAdmin,
                isOwner: user.isOwner,
            }
        };
    }
}