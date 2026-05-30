import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../infra/database/prisma.service';
import { QUEUES } from '../../../infra/queue/queues';

/** Snapshot patrimonial mensal: ativos - passivos por usuário. */
@Processor(QUEUES.NETWORTH)
export class NetWorthProcessor extends WorkerHost {
  private readonly logger = new Logger('NetWorthProcessor');
  constructor(private readonly prisma: PrismaService) { super(); }

  async process(_job: Job): Promise<void> {
    const users = await this.prisma.user.findMany({ where: { deletedAt: null }, select: { id: true } });
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    for (const u of users) {
      const accounts = await this.prisma.account.aggregate({ where: { userId: u.id }, _sum: { balance: true } });
      const investments = await this.prisma.investment.findMany({ where: { userId: u.id } });
      const invValue = investments.reduce(
        (acc, i) => acc + Number(i.quantity) * Number(i.currentPrice ?? i.averagePrice), 0);
      const cardUsage = await this.prisma.transaction.aggregate({
        where: { userId: u.id, type: 'expense', creditCardId: { not: null }, deletedAt: null },
        _sum: { value: true },
      });

      const assets = Number(accounts._sum.balance ?? 0) + invValue;
      const liabilities = Number(cardUsage._sum.value ?? 0);
      const netWorth = assets - liabilities;

      await this.prisma.netWorthSnapshot.upsert({
        where: { userId_snapshotMonth: { userId: u.id, snapshotMonth: monthStart } },
        update: { assets, liabilities, netWorth },
        create: { userId: u.id, snapshotMonth: monthStart, assets, liabilities, netWorth },
      });
    }
    this.logger.log(`Snapshots patrimoniais gerados para ${users.length} usuários`);
  }
}
