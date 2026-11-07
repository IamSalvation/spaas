import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '@spaas/identity';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) { }

  @Post('accounts')
  async createAccount(@Body() body: { code: string, name: string, type: string }) {
    return this.financeService.createGlAccount(body.code, body.name, body.type);
  }

  @Post('journal')
  async postJournal(@Body() body: { entryDate: string, memo: string, lines: any[] }) {
    return this.financeService.postJournalEntry(body.entryDate, body.memo, body.lines);
  }

  @Get('reports/trial-balance')
  async getTrialBalance() {
    return this.financeService.getTrialBalance();
  }
}