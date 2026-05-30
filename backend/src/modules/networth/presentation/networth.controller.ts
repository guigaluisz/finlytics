import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PremiumGuard } from '../../../common/guards/premium.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

@ApiTags('networth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PremiumGuard)
@Controller('networth')
export class NetWorthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Patrimônio atual: contas + investimentos (a mercado) - dívidas de cartão. */
  @Get()
  async current(@CurrentUser('id') userId: string) {
    const accounts = await this.prisma.account.aggregate({ where: { userId }, _sum: { balance: true } });
    const investments = await this.prisma.investment.findMany({ where: { userId } });
    const invValue = investments.reduce(
      (acc, i) => acc + Number(i.quantity) * Number(i.currentPrice ?? i.averagePrice), 0);
    const cardUsage = await this.prisma.transaction.aggregate({
      where: { userId, type: 'expense', creditCardId: { not: null }, deletedAt: null },
      _sum: { value: true },
    });
    const assets = Number(accounts._sum.balance ?? 0) + invValue;
    const liabilities = Number(cardUsage._sum.value ?? 0);
    return {
      assets,
      liabilities,
      netWorth: assets - liabilities,
      breakdown: { cash: Number(accounts._sum.balance ?? 0), investments: invValue, cardDebt: liabilities },
    };
  }

  /** Evolução: snapshots mensais gerados pelo job de patrimônio. */
  @Get('evolution')
  evolution(@CurrentUser('id') userId: string, @Query('months') months = 12) {
    return this.prisma.netWorthSnapshot.findMany({
      where: { userId },
      orderBy: { snapshotMonth: 'desc' },
      take: Number(months),
    });
  }
}
