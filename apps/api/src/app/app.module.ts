import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentityModule } from '@spaas/identity';
import { FinanceModule } from '@spaas/finance';
import { MasterdataModule } from '@spaas/masterdata';
import { SalesModule } from '@spaas/sales';
import { InventoryModule } from '@spaas/inventory';
import { ProcurementModule } from '@spaas/procurement';
import { ManufacturingModule } from '@spaas/manufacturing';
import { AnalyticsModule } from '@spaas/analytics';
import { ComplianceModule } from '@spaas/compliance';
import { DocumentsModule } from '@spaas/documents';
import { TenantInterceptor } from '@spaas/identity';
import { AuditInterceptor } from './audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    IdentityModule,
    FinanceModule,
    MasterdataModule,
    SalesModule,
    InventoryModule,
    ProcurementModule,
    ManufacturingModule,
    AnalyticsModule,
    ComplianceModule,
    DocumentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,  // Runs FIRST - sets tenant context
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,   // Runs SECOND - uses tenant context
    },
  ],
})
export class AppModule { }