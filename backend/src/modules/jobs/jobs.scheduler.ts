import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES } from '../../infra/queue/queues';

@Injectable()
export class JobsScheduler implements OnModuleInit {
  private readonly logger = new Logger('JobsScheduler');

  constructor(
    @InjectQueue(QUEUES.ALERTS) private readonly alerts: Queue,
    @InjectQueue(QUEUES.QUOTES) private readonly quotes: Queue,
    @InjectQueue(QUEUES.INVOICES) private readonly invoices: Queue,
    @InjectQueue(QUEUES.NETWORTH) private readonly networth: Queue,
  ) {}

  async onModuleInit() {
    if (process.env.JOBS_ENABLED === 'false') {
      this.logger.warn('Jobs agendados desativados (JOBS_ENABLED=false)');
      return;
    }
    const opts = (cron: string) => ({ repeat: { pattern: cron }, removeOnComplete: true, removeOnFail: 50 });

    await this.alerts.add('daily-alerts', {}, opts('0 8 * * *'));      // 08:00 todo dia
    await this.quotes.add('daily-quotes', {}, opts('0 18 * * 1-5'));   // 18:00 dias úteis
    await this.invoices.add('daily-invoices', {}, opts('0 6 * * *'));  // 06:00 todo dia
    await this.networth.add('monthly-networth', {}, opts('30 0 1 * *')); // dia 1, 00:30
    this.logger.log('Jobs agendados registrados (alertas, cotações, faturas, patrimônio)');
  }
}
