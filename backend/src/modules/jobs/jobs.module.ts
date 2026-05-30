import { Module } from '@nestjs/common';
import { JobsScheduler } from './jobs.scheduler';
import { JobsController } from './jobs.controller';
import { AlertsProcessor } from './processors/alerts.processor';
import { QuotesProcessor } from './processors/quotes.processor';
import { InvoicesProcessor } from './processors/invoices.processor';
import { NetWorthProcessor } from './processors/networth.processor';

@Module({
  controllers: [JobsController],
  providers: [JobsScheduler, AlertsProcessor, QuotesProcessor, InvoicesProcessor, NetWorthProcessor],
})
export class JobsModule {}
