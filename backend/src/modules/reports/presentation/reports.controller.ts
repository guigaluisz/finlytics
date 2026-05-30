import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../infra/database/prisma.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('monthly')
  monthly(@CurrentUser('id') userId: string, @Query('month') month: number, @Query('year') year: number) {
    const from = new Date(Number(year), Number(month) - 1, 1);
    const to = new Date(Number(year), Number(month), 0);
    return this.build(userId, from, to);
  }

  @Get('yearly')
  yearly(@CurrentUser('id') userId: string, @Query('year') year: number) {
    return this.build(userId, new Date(Number(year), 0, 1), new Date(Number(year), 11, 31));
  }

  private async build(userId: string, from: Date, to: Date) {
    const byCategory = await this.prisma.transaction.groupBy({
      by: ['categoryId', 'type'],
      where: { userId, deletedAt: null, date: { gte: from, lte: to } },
      _sum: { value: true },
    });
    const totals = byCategory.reduce(
      (acc, r) => {
        const v = Number(r._sum.value ?? 0);
        if (r.type === 'income') acc.income += v;
        else acc.expense += v;
        return acc;
      },
      { income: 0, expense: 0 },
    );
    return {
      period: { from, to },
      totals: { ...totals, balance: totals.income - totals.expense },
      byCategory,
    };
  }
}
