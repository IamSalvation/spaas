import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '@spaas/identity';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Post('receipts')
    async receiveStock(@Body() body: { itemId: string, quantity: number, unitCost: number }) {
        return this.inventoryService.receiveStock(body.itemId, body.quantity, body.unitCost);
    }

    @Get('stock/:itemId')
    async getStock(@Param('itemId') itemId: string) {
        return this.inventoryService.getStockLevel(itemId);
    }
}