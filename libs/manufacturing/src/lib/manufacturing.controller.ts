import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ManufacturingService } from './manufacturing.service';
import { JwtAuthGuard } from '@spaas/identity';

@Controller('manufacturing')
@UseGuards(JwtAuthGuard)
export class ManufacturingController {
    constructor(private readonly manufacturingService: ManufacturingService) { }

    @Post('bom')
    async createBom(@Body() body: { productItemId: string, components: any[] }) {
        return this.manufacturingService.createBom(body.productItemId, body.components);
    }

    @Post('orders')
    async createOrder(@Body() body: { productItemId: string, targetQuantity: number }) {
        return this.manufacturingService.createProductionOrder(body.productItemId, body.targetQuantity);
    }

    @Post('orders/complete')
    async completeOrder(@Body() body: { orderId: string }) {
        return this.manufacturingService.completeProductionOrder(body.orderId);
    }
}