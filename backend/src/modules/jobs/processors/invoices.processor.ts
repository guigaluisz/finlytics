import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../infra/database/prisma.service';
import { QUEUES } from '../../../infra/queue/queues';

/** Fechamento de fatura: no dia de fechamento, consolida e notifica o usuário. */
@Processor(QUEUES.INVOICES)
export class InvoicesProcessor extends WorkerHost {
  private readonly logger = new Logger('InvoicesProcessor');
  constructor(private readonly prisma: PrismaService) { super(); }

  async process(_job: Job): Promise<void> {
    const today = new Date().getDate();
    const cards = await this.prisma.creditCard.findMany({ where: { deletedAt: null, closingDay: today } });
    for (const c of cards) {
      const agg = await this.prisma.transaction.aggregate({
        where: { userId: c.userId, creditCardId: c.id, type: 'expense', deletedAt: null },
        _sum: { value: true },
      });
      const total = Number(agg._sum.value ?? 0);
      await this.prisma.alert.create({
        data: {
          userId: c.userId,
          type: 'invoice',
          title: 'Fatura fechada',
          message: `A fatura do cartão ${c.bank} fechou em R$ ${total.toFixed(2)}. Vence dia ${c.dueDay}.`,
        },
      });
    }
    this.logger.log(`Faturas fechadas: ${cards.length}`);
  }
}
