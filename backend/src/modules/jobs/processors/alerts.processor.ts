import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../infra/database/prisma.service';
import { QUEUES } from '../../../infra/queue/queues';

/**
 * Gera alertas financeiros:
 *  - Orçamento estourado (gasto do mês > limite da categoria)
 *  - Fatura próxima do vencimento (due_day nos próximos 3 dias)
 *  - Meta em risco (aporte necessário acima do ritmo atual)
 */
@Processor(QUEUES.ALERTS)
export class AlertsProcessor extends WorkerHost {
  private readonly logger = new Logger('AlertsProcessor');
  constructor(private readonly prisma: PrismaService) { super(); }

  async process(job: Job): Promise<void> {
    this.logger.log(`Rodando job de alertas (${job.name})`);
    await this.checkBudgets();
    await this.checkInvoicesDue();
    await this.checkGoalsAtRisk();
  }

  private async checkBudgets() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0);

    const budgets = await this.prisma.budget.findMany({ where: { month, year } });
    for (const b of budgets) {
      const spent = await this.prisma.transaction.aggregate({
        where: { userId: b.userId, categoryId: b.categoryId, type: 'expense', deletedAt: null, date: { gte: from, lte: to } },
        _sum: { value: true },
      });
      const total = Number(spent._sum.value ?? 0);
      if (total > Number(b.monthlyLimit)) {
        await this.createOnce(b.userId, 'budget', 'Orçamento estourado',
          `Você ultrapassou o limite de uma categoria neste mês (gasto: R$ ${total.toFixed(2)}).`);
      }
    }
  }

  private async checkInvoicesDue() {
    const today = new Date().getDate();
    const cards = await this.prisma.creditCard.findMany({ where: { deletedAt: null } });
    for (const c of cards) {
      const daysUntil = (c.dueDay - today + 31) % 31;
      if (daysUntil >= 0 && daysUntil <= 3) {
        await this.createOnce(c.userId, 'invoice', 'Fatura próxima do vencimento',
          `A fatura do cartão ${c.bank} vence dia ${c.dueDay}.`);
      }
    }
  }

  private async checkGoalsAtRisk() {
    const goals = await this.prisma.financialGoal.findMany({ where: { status: 'active' } });
    for (const g of goals) {
      const remaining = Number(g.targetAmount) - Number(g.currentAmount);
      if (remaining > 0 && new Date(g.targetDate) < new Date()) {
        await this.createOnce(g.userId, 'goal', 'Meta em risco',
          `A meta "${g.title}" passou da data-alvo e ainda faltam R$ ${remaining.toFixed(2)}.`);
      }
    }
  }

  /** Evita duplicar alerta idêntico não lido. */
  private async createOnce(userId: string, type: any, title: string, message: string) {
    const exists = await this.prisma.alert.findFirst({ where: { userId, type, title, read: false } });
    if (!exists) {
      await this.prisma.alert.create({ data: { userId, type, title, message } });
      this.logger.log(`Alerta criado p/ ${userId}: ${title}`);
    }
  }
}
