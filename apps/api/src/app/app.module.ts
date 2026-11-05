import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentityModule } from '@spaas/identity';
import { FinanceModule } from '@spaas/finance';
import { MasterdataModule } from '@spaas/masterdata';
import { SalesModule } from '@spaas/sales';
import { InventoryModule } from '@spaas/inventory';
import { ProcurementModule } from '@spaas/procurement';
import { ManufacturingModule } from '@spaas/manufacturing';
import { AnalyticsModule } from '@spaas/analytics'; // <-- ADD THIS

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
    AnalyticsModule // <-- ADD THIS
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }