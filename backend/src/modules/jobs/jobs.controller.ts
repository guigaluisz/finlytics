import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { QUEUES } from '../../infra/queue/queues';

@ApiTags('jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(
    @InjectQueue(QUEUES.ALERTS) private readonly alerts: Queue,
    @InjectQueue(QUEUES.QUOTES) private readonly quotes: Queue,
    @InjectQueue(QUEUES.INVOICES) private readonly invoices: Queue,
    @InjectQueue(QUEUES.NETWORTH) private readonly networth: Queue,
  ) {}

  @Post('run/alerts')
  async runAlerts() { await this.alerts.add('manual-alerts', {}); return { queued: 'alerts' }; }

  @Post('run/quotes')
  async runQuotes() { await this.quotes.add('manual-quotes', {}); return { queued: 'quotes' }; }

  @Post('run/invoices')
  async runInvoices() { await this.invoices.add('manual-invoices', {}); return { queued: 'invoices' }; }

  @Post('run/networth')
  async runNetworth() { await this.networth.add('manual-networth', {}); return { queued: 'networth' }; }
}
