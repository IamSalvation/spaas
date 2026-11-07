import { Controller, Get, UseGuards } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '@spaas/identity';

@Controller('compliance')
@UseGuards(JwtAuthGuard)
export class ComplianceController {
    constructor(private readonly complianceService: ComplianceService) { }

    @Get('logs')
    async getLogs() {
        return this.complianceService.getLogs();
    }
}