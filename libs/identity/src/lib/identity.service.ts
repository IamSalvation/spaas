import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { db, withTenant, TenantStore } from '@spaas/shared';
import { tenants, users } from './identity.module';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class IdentityService {
    constructor(private readonly jwtService: JwtService) { }

    async registerCompany(companyName: string, email: string, pass: string) {
        const passwordHash = await bcrypt.hash(pass, 10);

        // 1. Create the Tenant
        const [tenant] = await db.insert(tenants).values({ name: companyName }).returning();

        // 2. Create the User inside a Tenant Context so RLS allows it
        const user = await TenantStore.run({ tenantId: tenant.id, userId: 'system' }, async () => {
            return await withTenant(async (tx: PostgresJsDatabase<any>) => {
                const [newUser] = await tx.insert(users).values({
                    tenantId: tenant.id,
                    email,
                    passwordHash,
                    role: 'admin'
                }).returning();
                return newUser;
            });
        });

        return this.generateToken(user);
    }

    async login(email: string, pass: string, tenantId: string) {
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

    private generateToken(user: any) {
        const payload = { sub: user.id, email: user.email, tenantId: user.tenantId, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: { id: user.id, email: user.email, tenantId: user.tenantId, role: user.role }
        };
    }
}