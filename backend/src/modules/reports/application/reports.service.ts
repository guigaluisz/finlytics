import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';

export interface ReportLine {
  categoriaId: string | null;
  categoriaNome: string;
  tipo: 'receita' | 'despesa';
  total: number;
}
export interface Report {
  periodo: { de: string; ate: string; rotulo: string };
  totais: { receitas: number; despesas: number; saldo: number };
  linhas: ReportLine[];
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  mensal(usuarioId: string, mes: number, ano: number) {
    const de = new Date(ano, mes - 1, 1);
    const ate = new Date(ano, mes, 0);
    return this.build(usuarioId, de, ate, `${String(mes).padStart(2, '0')}/${ano}`);
  }

  anual(usuarioId: string, ano: number) {
    return this.build(usuarioId, new Date(ano, 0, 1), new Date(ano, 11, 31), `Ano ${ano}`);
  }

  async build(usuarioId: string, de: Date, ate: Date, rotulo: string): Promise<Report> {
    const agrupado = await this.prisma.transaction.groupBy({
      by: ['categoriaId', 'tipo'],
      where: { usuarioId, excluidoEm: null, data: { gte: de, lte: ate } },
      _sum: { valor: true },
    });
    const categorias = await this.prisma.category.findMany({ where: { usuarioId } });
    const nomeDe = (id: string | null) => categorias.find((c) => c.id === id)?.nome ?? 'Sem categoria';

    const linhas: ReportLine[] = agrupado.map((g) => ({
      categoriaId: g.categoriaId,
      categoriaNome: nomeDe(g.categoriaId),
      tipo: g.tipo as 'receita' | 'despesa',
      total: Number(g._sum.valor ?? 0),
    }));

    const receitas = linhas.filter((l) => l.tipo === 'receita').reduce((a, l) => a + l.total, 0);
    const despesas = linhas.filter((l) => l.tipo === 'despesa').reduce((a, l) => a + l.total, 0);

    return {
      periodo: { de: de.toISOString().slice(0, 10), ate: ate.toISOString().slice(0, 10), rotulo },
      totais: { receitas, despesas, saldo: receitas - despesas },
      linhas: linhas.sort((a, b) => b.total - a.total),
    };
  }
}
