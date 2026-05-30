import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../infra/database/prisma.service';
import { QUEUES } from '../../../infra/queue/queues';

@Processor(QUEUES.ALERTS)
export class AlertsProcessor extends WorkerHost {
  private readonly logger = new Logger('AlertsProcessor');
  constructor(private readonly prisma: PrismaService) { super(); }

  async process(job: Job): Promise<void> {
    this.logger.log(`Rodando job de alertas (${job.name})`);
    await this.verificarOrcamentos();
    await this.verificarFaturas();
    await this.verificarMetasEmRisco();
  }

  private async verificarOrcamentos() {
    const agora = new Date();
    const mes = agora.getMonth() + 1;
    const ano = agora.getFullYear();
    const de = new Date(ano, mes - 1, 1);
    const ate = new Date(ano, mes, 0);

    const orcamentos = await this.prisma.budget.findMany({ where: { mes, ano } });
    for (const o of orcamentos) {
      const gasto = await this.prisma.transaction.aggregate({
        where: { usuarioId: o.usuarioId, categoriaId: o.categoriaId, tipo: 'despesa', excluidoEm: null, data: { gte: de, lte: ate } },
        _sum: { valor: true },
      });
      const total = Number(gasto._sum.valor ?? 0);
      if (total > Number(o.limiteMensal)) {
        await this.criarUnico(o.usuarioId, 'orcamento', 'Orçamento estourado',
          `Você ultrapassou o limite de uma categoria neste mês (gasto: R$ ${total.toFixed(2)}).`);
      }
    }
  }

  private async verificarFaturas() {
    const hoje = new Date().getDate();
    const cartoes = await this.prisma.creditCard.findMany({ where: { excluidoEm: null } });
    for (const c of cartoes) {
      const diasAte = (c.diaVencimento - hoje + 31) % 31;
      if (diasAte >= 0 && diasAte <= 3) {
        await this.criarUnico(c.usuarioId, 'fatura', 'Fatura próxima do vencimento',
          `A fatura do cartão ${c.banco} vence dia ${c.diaVencimento}.`);
      }
    }
  }

  private async verificarMetasEmRisco() {
    const metas = await this.prisma.financialGoal.findMany({ where: { status: 'ativa' } });
    for (const m of metas) {
      const faltam = Number(m.valorAlvo) - Number(m.valorAtual);
      if (faltam > 0 && new Date(m.dataAlvo) < new Date()) {
        await this.criarUnico(m.usuarioId, 'meta', 'Meta em risco',
          `A meta "${m.titulo}" passou da data-alvo e ainda faltam R$ ${faltam.toFixed(2)}.`);
      }
    }
  }

  private async criarUnico(usuarioId: string, tipo: any, titulo: string, mensagem: string) {
    const existe = await this.prisma.alert.findFirst({ where: { usuarioId, tipo, titulo, lida: false } });
    if (!existe) {
      await this.prisma.alert.create({ data: { usuarioId, tipo, titulo, mensagem } });
      this.logger.log(`Alerta criado p/ ${usuarioId}: ${titulo}`);
    }
  }
}
