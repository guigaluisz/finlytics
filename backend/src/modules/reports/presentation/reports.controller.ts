import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PremiumGuard } from '../../../common/guards/premium.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ReportsService } from '../application/reports.service';
import { ReportExportService } from '../application/report-export.service';

@ApiTags('relatorios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('relatorios')
export class ReportsController {
  constructor(
    private readonly relatorios: ReportsService,
    private readonly exportador: ReportExportService,
  ) {}

  @Get('mensal')
  mensal(@CurrentUser('id') usuarioId: string, @Query('mes') mes: number, @Query('ano') ano: number) {
    return this.relatorios.mensal(usuarioId, Number(mes), Number(ano));
  }

  @Get('anual')
  anual(@CurrentUser('id') usuarioId: string, @Query('ano') ano: number) {
    return this.relatorios.anual(usuarioId, Number(ano));
  }

  @Get('mensal/exportar')
  @UseGuards(PremiumGuard)
  async exportarMensal(
    @CurrentUser('id') usuarioId: string,
    @Query('mes') mes: number,
    @Query('ano') ano: number,
    @Query('formato') formato: 'pdf' | 'xlsx' = 'pdf',
    @Res() res: Response,
  ) {
    const relatorio = await this.relatorios.mensal(usuarioId, Number(mes), Number(ano));
    await this.enviar(res, relatorio, formato, `relatorio-${ano}-${mes}`);
  }

  @Get('anual/exportar')
  @UseGuards(PremiumGuard)
  async exportarAnual(
    @CurrentUser('id') usuarioId: string,
    @Query('ano') ano: number,
    @Query('formato') formato: 'pdf' | 'xlsx' = 'pdf',
    @Res() res: Response,
  ) {
    const relatorio = await this.relatorios.anual(usuarioId, Number(ano));
    await this.enviar(res, relatorio, formato, `relatorio-${ano}`);
  }

  private async enviar(res: Response, relatorio: any, formato: 'pdf' | 'xlsx', nome: string) {
    if (formato === 'xlsx') {
      const buf = await this.exportador.toExcel(relatorio);
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${nome}.xlsx"`,
      });
      return res.send(buf);
    }
    const buf = await this.exportador.toPdf(relatorio);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${nome}.pdf"` });
    return res.send(buf);
  }
}
