import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('platform')
@UseGuards(JwtAuthGuard)
export class PlatformController {
    constructor(private readonly platformService: PlatformService) { }

    @Get('stats')
    async getStats(@Req() req: any) {
        return this.platformService.getPlatformStats(req.user);
    }

    @Get('tenants')
    async getAll(@Req() req: any) {
        return this.platformService.listAllTenants(req.user);
    }

    @Get('tenants/:id')
    async getDetail(@Req() req: any, @Param('id') id: string) {
        return this.platformService.getTenantDetail(req.user, id);
    }

    @Patch('tenants/:id/status')
    async updateStatus(@Req() req: any, @Param('id') id: string, @Body() body: { status: string }) {
        return this.platformService.updateTenantStatus(req.user, id, body.status);
    }

    @Patch('tenants/:id/tier')
    async updateTier(@Req() req: any, @Param('id') id: string, @Body() body: { tier: string }) {
        return this.platformService.updateTenantTier(req.user, id, body.tier);
    }

    @Patch('tenants/:id/limits')
    async updateLimits(@Req() req: any, @Param('id') id: string, @Body() body: any) {
        return this.platformService.updateTenantLimits(req.user, id, body);
    }

    @Post('tenants/:id/hard-delete')
    async hardDelete(@Req() req: any, @Param('id') id: string, @Body() body: { confirmName: string }) {
        return this.platformService.hardDeleteTenant(req.user, id, body.confirmName);
    }
}