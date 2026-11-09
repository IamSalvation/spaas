import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '@spaas/identity';
import { Response } from 'express';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Get('invoice/:id')
    async getInvoice(@Param('id') id: string, @Res() res: Response) {
        const pdfBuffer = await this.documentsService.generateInvoicePdf(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    }

    @Get('purchase-order/:id')
    async getPurchaseOrder(@Param('id') id: string, @Res() res: Response) {
        const pdfBuffer = await this.documentsService.generatePurchaseOrderPdf(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=po-${id}.pdf`,
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    }

    @Get('production-order/:id')
    async getProductionOrder(@Param('id') id: string, @Res() res: Response) {
        const pdfBuffer = await this.documentsService.generateProductionOrderPdf(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=prod-order-${id}.pdf`,
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    }
}