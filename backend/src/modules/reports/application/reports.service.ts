import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';

export interface ReportLine {
  categoryId: string | null;
  categoryName: string;
  type: 'income' | 'expense';
  total: number;
}
export interface Report {
  period: { from: string; to: string; label: string };
  totals: { income: number; expense: number; balance: number };
  lines: ReportLine[];
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  monthly(userId: string, month: number, year: number) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0);
    return this.build(userId, from, to, `${String(month).padStart(2, '0')}/${year}`);
  }

  yearly(userId: string, year: number) {
    return this.build(userId, new Date(year, 0, 1), new Date(year, 11, 31), `Ano ${year}`);
  }

  async build(userId: string, from: Date, to: Date, label: string): Promise<Report> {
    const grouped = await this.prisma.transaction.groupBy({
      by: ['categoryId', 'type'],
      where: { userId, deletedAt: null, date: { gte: from, lte: to } },
      _sum: { value: true },
    });
    const categories = await this.prisma.category.findMany({ where: { userId } });
    const nameOf = (id: string | null) =>
      categories.find((c) => c.id === id)?.name ?? 'Sem categoria';

    const lines: ReportLine[] = grouped.map((g) => ({
      categoryId: g.categoryId,
      categoryName: nameOf(g.categoryId),
      type: g.type as 'income' | 'expense',
      total: Number(g._sum.value ?? 0),
    }));

    const income = lines.filter((l) => l.type === 'income').reduce((a, l) => a + l.total, 0);
    const expense = lines.filter((l) => l.type === 'expense').reduce((a, l) => a + l.total, 0);

    return {
      period: { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10), label },
      totals: { income, expense, balance: income - expense },
      lines: lines.sort((a, b) => b.total - a.total),
    };
  }
}
