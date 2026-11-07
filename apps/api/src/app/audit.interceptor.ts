import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantStore, db } from '@spaas/shared';
import { auditLogs } from '@spaas/compliance';
import { sql } from 'drizzle-orm';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const method = req.method;

        // Only log modifying actions (POST, PUT, DELETE)
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) && !req.originalUrl.includes('/auth/login')) {

            // We use 'void' here to fire-and-forget the log so we don't slow down the API response
            void (async () => {
                try {
                    const contextStore = TenantStore.getStore();
                    const user = req.user;

                    if (contextStore && user) {
                        await db.transaction(async (tx) => {
                            await tx.execute(sql`SELECT set_config('app.current_tenant', ${contextStore.tenantId}, true)`);
                            await tx.insert(auditLogs).values({
                                tenantId: contextStore.tenantId,
                                userEmail: user.email,
                                action: method,
                                resource: req.originalUrl,
                                payload: req.body || {},
                            });
                        });
                    }
                } catch (err) {
                    console.error('Audit Log Failed:', err);
                }
            })();
        }

        return next.handle();
    }
}