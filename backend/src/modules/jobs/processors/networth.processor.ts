import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../infra/database/prisma.service';
import { QUEUES } from '../../../infra/queue/queues';

@Processor(QUEUES.NETWORTH)
export class NetWorthProcessor extends WorkerHost {
  private readonly logger = new Logger('NetWorthProcessor');
  constructor(private readonly prisma: PrismaService) { super(); }

  async process(_job: Job): Promise<void> {
    const usuarios = await this.prisma.user.findMany({ where: { excluidoEm: null }, select: { id: true } });
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    for (const u of usuarios) {
      const contas = await this.prisma.account.aggregate({ where: { usuarioId: u.id }, _sum: { saldo: true } });
      const investimentos = await this.prisma.investment.findMany({ where: { usuarioId: u.id } });
      const valorInv = investimentos.reduce(
        (acc, i) => acc + Number(i.quantidade) * Number(i.precoAtual ?? i.precoMedio), 0);
      const usoCartao = await this.prisma.transaction.aggregate({
        where: { usuarioId: u.id, tipo: 'despesa', cartaoId: { not: null }, excluidoEm: null },
        _sum: { valor: true },
      });

      const ativos = Number(contas._sum.saldo ?? 0) + valorInv;
      const passivos = Number(usoCartao._sum.valor ?? 0);
      const patrimonioLiquido = ativos - passivos;

      await this.prisma.netWorthSnapshot.upsert({
        where: { usuarioId_mesReferencia: { usuarioId: u.id, mesReferencia: inicioMes } },
        update: { ativos, passivos, patrimonioLiquido },
        create: { usuarioId: u.id, mesReferencia: inicioMes, ativos, passivos, patrimonioLiquido },
      });
    }
    this.logger.log(`Snapshots patrimoniais gerados para ${usuarios.length} usuários`);
  }
}
