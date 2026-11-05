import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { JwtAuthGuard } from '@spaas/identity';

@Controller('procurement')
@UseGuards(JwtAuthGuard)
export class ProcurementController {
    constructor(private readonly procurementService: ProcurementService) { }

    @Post('orders')
    async createOrder(@Body() body: { vendorId: string, orderDate: string, lines: any[] }) {
        return this.procurementService.createPurchaseOrder(body.vendorId, body.orderDate, body.lines);
    }

    @Post('orders/receive')
    async receiveOrder(@Body() body: { purchaseOrderId: string }) {
        return this.procurementService.receivePurchaseOrder(body.purchaseOrderId);
    }
}