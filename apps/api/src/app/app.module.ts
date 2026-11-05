import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentityModule } from '@spaas/identity';
import { FinanceModule } from '@spaas/finance';
import { MasterdataModule } from '@spaas/masterdata';
import { SalesModule } from '@spaas/sales';
import { InventoryModule } from '@spaas/inventory'; // <-- ADD THIS

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    IdentityModule,
    FinanceModule,
    MasterdataModule,
    SalesModule,
    InventoryModule // <-- ADD THIS
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }