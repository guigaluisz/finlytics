import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PremiumGuard } from '../../../common/guards/premium.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

@ApiTags('patrimonio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PremiumGuard)
@Controller('patrimonio')
export class NetWorthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async atual(@CurrentUser('id') usuarioId: string) {
    const contas = await this.prisma.account.aggregate({ where: { usuarioId }, _sum: { saldo: true } });
    const investimentos = await this.prisma.investment.findMany({ where: { usuarioId } });
    const valorInvestido = investimentos.reduce(
      (acc, i) => acc + Number(i.quantidade) * Number(i.precoAtual ?? i.precoMedio), 0);
    const usoCartao = await this.prisma.transaction.aggregate({
      where: { usuarioId, tipo: 'despesa', cartaoId: { not: null }, excluidoEm: null },
      _sum: { valor: true },
    });
    const ativos = Number(contas._sum.saldo ?? 0) + valorInvestido;
    const passivos = Number(usoCartao._sum.valor ?? 0);
    return {
      ativos,
      passivos,
      patrimonioLiquido: ativos - passivos,
      composicao: { dinheiro: Number(contas._sum.saldo ?? 0), investimentos: valorInvestido, dividaCartao: passivos },
    };
  }

  @Get('evolucao')
  evolucao(@CurrentUser('id') usuarioId: string, @Query('meses') meses = 12) {
    return this.prisma.netWorthSnapshot.findMany({
      where: { usuarioId },
      orderBy: { mesReferencia: 'desc' },
      take: Number(meses),
    });
  }
}
