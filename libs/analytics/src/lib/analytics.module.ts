import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { IdentityModule } from '@spaas/identity';

@Module({
	imports: [IdentityModule],
	controllers: [AnalyticsController],
	providers: [AnalyticsService],
})
export class AnalyticsModule { }