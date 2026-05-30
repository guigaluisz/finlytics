import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../infra/database/prisma.service';
import { QUEUES } from '../../../infra/queue/queues';

@Processor(QUEUES.QUOTES)
export class QuotesProcessor extends WorkerHost {
  private readonly logger = new Logger('QuotesProcessor');
  constructor(private readonly prisma: PrismaService) { super(); }

  async process(_job: Job): Promise<void> {
    const investimentos = await this.prisma.investment.findMany();
    for (const inv of investimentos) {
      const medio = Number(inv.precoMedio);
      const fator = 1 + (Math.random() * 0.13 - 0.05); // -5% a +8% (simulado)
      await this.prisma.investment.update({
        where: { id: inv.id },
        data: { precoAtual: Number((medio * fator).toFixed(6)) },
      });
    }
    this.logger.log(`Cotações atualizadas para ${investimentos.length} ativos`);
  }
}
