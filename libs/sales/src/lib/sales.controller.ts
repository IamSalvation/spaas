import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '@spaas/identity';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post('orders')
    async createOrder(@Body() body: { customerId: string, orderDate: string, lines: any[] }) {
        return this.salesService.createSalesOrder(body.customerId, body.orderDate, body.lines);
    }

    @Post('invoices')
    async invoiceOrder(@Body() body: { salesOrderId: string, invoiceDate: string }) {
        return this.salesService.invoiceSalesOrder(body.salesOrderId, body.invoiceDate);
    }
}