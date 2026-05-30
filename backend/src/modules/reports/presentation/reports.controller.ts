import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PremiumGuard } from '../../../common/guards/premium.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ReportsService } from '../application/reports.service';
import { ReportExportService } from '../application/report-export.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reports: ReportsService,
    private readonly exporter: ReportExportService,
  ) {}

  @Get('monthly')
  monthly(@CurrentUser('id') userId: string, @Query('month') month: number, @Query('year') year: number) {
    return this.reports.monthly(userId, Number(month), Number(year));
  }

  @Get('yearly')
  yearly(@CurrentUser('id') userId: string, @Query('year') year: number) {
    return this.reports.yearly(userId, Number(year));
  }

  /** Exporta o relatório mensal. format=pdf|xlsx (download). Premium. */
  @Get('monthly/export')
  @UseGuards(PremiumGuard)
  async exportMonthly(
    @CurrentUser('id') userId: string,
    @Query('month') month: number,
    @Query('year') year: number,
    @Query('format') format: 'pdf' | 'xlsx' = 'pdf',
    @Res() res: Response,
  ) {
    const report = await this.reports.monthly(userId, Number(month), Number(year));
    await this.send(res, report, format, `relatorio-${year}-${month}`);
  }

  @Get('yearly/export')
  @UseGuards(PremiumGuard)
  async exportYearly(
    @CurrentUser('id') userId: string,
    @Query('year') year: number,
    @Query('format') format: 'pdf' | 'xlsx' = 'pdf',
    @Res() res: Response,
  ) {
    const report = await this.reports.yearly(userId, Number(year));
    await this.send(res, report, format, `relatorio-${year}`);
  }

  private async send(res: Response, report: any, format: 'pdf' | 'xlsx', name: string) {
    if (format === 'xlsx') {
      const buf = await this.exporter.toExcel(report);
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${name}.xlsx"`,
      });
      return res.send(buf);
    }
    const buf = await this.exporter.toPdf(report);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${name}.pdf"`,
    });
    return res.send(buf);
  }
}
