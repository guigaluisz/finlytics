import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from './queues';

function redisConnection() {
  const url = new URL(process.env.REDIS_URL ?? 'redis://localhost:6379');
  return { host: url.hostname, port: Number(url.port || 6379) };
}

@Global()
@Module({
  imports: [
    BullModule.forRoot({ connection: redisConnection() }),
    BullModule.registerQueue(
      { name: QUEUES.ALERTS },
      { name: QUEUES.QUOTES },
      { name: QUEUES.INVOICES },
      { name: QUEUES.NETWORTH },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
