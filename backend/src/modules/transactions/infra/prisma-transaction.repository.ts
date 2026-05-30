import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';
import { ListFilters, TransactionRepository } from '../domain/transaction.repository';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, data: any) {
    return this.prisma.transaction.create({ data: { ...data, userId } });
  }

  findById(userId: string, id: string) {
    return this.prisma.transaction.findFirst({ where: { id, userId, deletedAt: null } });
  }

  async list(userId: string, f: ListFilters) {
    const where: any = { userId, deletedAt: null };
    if (f.type) where.type = f.type;
    if (f.categoryId) where.categoryId = f.categoryId;
    if (f.from || f.to) where.date = { gte: f.from ? new Date(f.from) : undefined, lte: f.to ? new Date(f.to) : undefined };
    if (f.q) where.description = { contains: f.q, mode: 'insensitive' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (f.page - 1) * f.limit,
        take: f.limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);
    return { items, total };
  }

  update(userId: string, id: string, data: any) {
    return this.prisma.transaction.update({ where: { id }, data });
  }

  async softDelete(userId: string, id: string) {
    await this.prisma.transaction.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async summary(userId: string, from: string, to: string) {
    const rows = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { userId, deletedAt: null, date: { gte: new Date(from), lte: new Date(to) } },
      _sum: { value: true },
    });
    const get = (t: string) => Number(rows.find((r) => r.type === t)?._sum.value ?? 0);
    return { income: get('income'), expense: get('expense') };
  }
}
