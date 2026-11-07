import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { IdentityModule } from '@spaas/identity';
import { SalesModule } from '@spaas/sales';
import { MasterdataModule } from '@spaas/masterdata';

@Module({
	imports: [IdentityModule, SalesModule, MasterdataModule],
	controllers: [DocumentsController],
	providers: [DocumentsService],
})
export class DocumentsModule { }