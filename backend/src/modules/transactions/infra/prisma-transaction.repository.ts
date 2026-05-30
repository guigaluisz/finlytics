import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';
import { ListFilters, TransactionRepository } from '../domain/transaction.repository';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(usuarioId: string, data: any) {
    return this.prisma.transaction.create({ data: { ...data, usuarioId } });
  }

  findById(usuarioId: string, id: string) {
    return this.prisma.transaction.findFirst({ where: { id, usuarioId, excluidoEm: null } });
  }

  async list(usuarioId: string, f: ListFilters) {
    const where: any = { usuarioId, excluidoEm: null };
    if (f.tipo) where.tipo = f.tipo;
    if (f.categoriaId) where.categoriaId = f.categoriaId;
    if (f.de || f.ate) where.data = { gte: f.de ? new Date(f.de) : undefined, lte: f.ate ? new Date(f.ate) : undefined };
    if (f.busca) where.descricao = { contains: f.busca, mode: 'insensitive' };

    const [itens, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: { data: 'desc' },
        skip: (f.pagina - 1) * f.limite,
        take: f.limite,
      }),
      this.prisma.transaction.count({ where }),
    ]);
    return { itens, total };
  }

  update(usuarioId: string, id: string, data: any) {
    return this.prisma.transaction.update({ where: { id }, data });
  }

  async softDelete(usuarioId: string, id: string) {
    await this.prisma.transaction.update({ where: { id }, data: { excluidoEm: new Date() } });
  }

  async summary(usuarioId: string, de: string, ate: string) {
    const linhas = await this.prisma.transaction.groupBy({
      by: ['tipo'],
      where: { usuarioId, excluidoEm: null, data: { gte: new Date(de), lte: new Date(ate) } },
      _sum: { valor: true },
    });
    const get = (t: string) => Number(linhas.find((r) => r.tipo === t)?._sum.valor ?? 0);
    return { receitas: get('receita'), despesas: get('despesa') };
  }
}
