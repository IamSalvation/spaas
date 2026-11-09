import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantStore } from '@spaas/shared';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.tenantId) {
            return next.handle();
        }

        // Wrap the entire handler in TenantStore.run() so AsyncLocalStorage
        // propagates correctly through all async operations
        return new Observable((subscriber) => {
            TenantStore.run(
                { tenantId: user.tenantId, userId: user.sub },
                async () => {
                    try {
                        const result = await next.handle().toPromise();
                        subscriber.next(result);
                        subscriber.complete();
                    } catch (err) {
                        subscriber.error(err);
                    }
                }
            );
        });
    }
}