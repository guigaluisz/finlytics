import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { QUEUES } from '../../infra/queue/queues';

@ApiTags('tarefas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tarefas')
export class JobsController {
  constructor(
    @InjectQueue(QUEUES.ALERTS) private readonly alertas: Queue,
    @InjectQueue(QUEUES.QUOTES) private readonly cotacoes: Queue,
    @InjectQueue(QUEUES.INVOICES) private readonly faturas: Queue,
    @InjectQueue(QUEUES.NETWORTH) private readonly patrimonio: Queue,
  ) {}

  @Post('executar/alertas')
  async execAlertas() { await this.alertas.add('manual-alertas', {}); return { enfileirado: 'alertas' }; }

  @Post('executar/cotacoes')
  async execCotacoes() { await this.cotacoes.add('manual-cotacoes', {}); return { enfileirado: 'cotacoes' }; }

  @Post('executar/faturas')
  async execFaturas() { await this.faturas.add('manual-faturas', {}); return { enfileirado: 'faturas' }; }

  @Post('executar/patrimonio')
  async execPatrimonio() { await this.patrimonio.add('manual-patrimonio', {}); return { enfileirado: 'patrimonio' }; }
}
