import { Module } from '@nestjs/common';
import { TransactionsController } from './presentation/transactions.controller';
import { TransactionsService } from './application/transactions.service';
import { PrismaTransactionRepository } from './infra/prisma-transaction.repository';
import { TRANSACTION_REPOSITORY } from './domain/transaction.repository';

@Module({
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    { provide: TRANSACTION_REPOSITORY, useClass: PrismaTransactionRepository },
  ],
})
export class TransactionsModule {}
