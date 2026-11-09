import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { db } from '@spaas/shared';
import { tenants } from './identity.module';
import { eq } from 'drizzle-orm';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing token');
        }

        const token = authHeader.split(' ')[1];

        let payload: any;
        try {
            payload = this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException('Invalid token');
        }

        // Check if tenant is paused or deleted
        const [tenant] = await db.select().from(tenants).where(eq(tenants.id, payload.tenantId));
        if (!tenant) throw new UnauthorizedException('Tenant not found');

        if (tenant.status === 'paused') {
            throw new UnauthorizedException('This account has been paused. Please contact support.');
        }
        if (tenant.status === 'deleted') {
            throw new UnauthorizedException('This account has been deleted.');
        }

        // Attach user to request — TenantInterceptor will wrap this in TenantStore
        request.user = payload;
        return true;
    }
}