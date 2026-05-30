import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../infra/database/prisma.service';
import { QUEUES } from '../../../infra/queue/queues';

@Processor(QUEUES.INVOICES)
export class InvoicesProcessor extends WorkerHost {
  private readonly logger = new Logger('InvoicesProcessor');
  constructor(private readonly prisma: PrismaService) { super(); }

  async process(_job: Job): Promise<void> {
    const hoje = new Date().getDate();
    const cartoes = await this.prisma.creditCard.findMany({ where: { excluidoEm: null, diaFechamento: hoje } });
    for (const c of cartoes) {
      const agg = await this.prisma.transaction.aggregate({
        where: { usuarioId: c.usuarioId, cartaoId: c.id, tipo: 'despesa', excluidoEm: null },
        _sum: { valor: true },
      });
      const total = Number(agg._sum.valor ?? 0);
      await this.prisma.alert.create({
        data: {
          usuarioId: c.usuarioId,
          tipo: 'fatura',
          titulo: 'Fatura fechada',
          mensagem: `A fatura do cartão ${c.banco} fechou em R$ ${total.toFixed(2)}. Vence dia ${c.diaVencimento}.`,
        },
      });
    }
    this.logger.log(`Faturas fechadas: ${cartoes.length}`);
  }
}
