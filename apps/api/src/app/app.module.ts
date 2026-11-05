import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentityModule } from '@spaas/identity';
import { FinanceModule } from '@spaas/finance'; // <-- Added

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    IdentityModule,
    FinanceModule // <-- Added
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }