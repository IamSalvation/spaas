import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MasterdataService } from './masterdata.service';
import { JwtAuthGuard } from '@spaas/identity';

@Controller('masterdata')
@UseGuards(JwtAuthGuard)
export class MasterdataController {
    constructor(private readonly masterdataService: MasterdataService) { }

    @Post('parties')
    async createParty(@Body() body: { type: string, name: string, email?: string, phone?: string }) {
        return this.masterdataService.createParty(body.type, body.name, body.email, body.phone);
    }

    @Post('items')
    async createItem(@Body() body: { sku: string, name: string, uom: string }) {
        return this.masterdataService.createItem(body.sku, body.name, body.uom);
    }
}