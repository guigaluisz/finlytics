import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../infra/database/prisma.service';
import { QUEUES } from '../../../infra/queue/queues';

/**
 * Atualiza o preço atual dos investimentos.
 * Em produção: integrar com provedor de cotações (B3/Brapi/Yahoo).
 * Aqui: simulação determinística baseada no preço médio para o scaffold funcionar.
 */
@Processor(QUEUES.QUOTES)
export class QuotesProcessor extends WorkerHost {
  private readonly logger = new Logger('QuotesProcessor');
  constructor(private readonly prisma: PrismaService) { super(); }

  async process(_job: Job): Promise<void> {
    const investments = await this.prisma.investment.findMany();
    for (const inv of investments) {
      const avg = Number(inv.averagePrice);
      // variação simulada de -5% a +8%
      const factor = 1 + (Math.random() * 0.13 - 0.05);
      await this.prisma.investment.update({
        where: { id: inv.id },
        data: { currentPrice: Number((avg * factor).toFixed(6)) },
      });
    }
    this.logger.log(`Cotações atualizadas para ${investments.length} ativos`);
  }
}
