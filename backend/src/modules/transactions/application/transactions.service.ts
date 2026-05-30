import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../common/errors/domain.error';
import { Money } from '../domain/money.vo';
import { TRANSACTION_REPOSITORY, TransactionRepository, ListFilters } from '../domain/transaction.repository';
import { CreateTransactionDto, UpdateTransactionDto } from '../presentation/dtos';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly repo: TransactionRepository,
  ) {}

  create(userId: string, dto: CreateTransactionDto) {
    const money = Money.fromNumber(dto.value); // valida invariante (>0)
    return this.repo.create(userId, {
      type: dto.type,
      value: money.amount,
      categoryId: dto.categoryId,
      creditCardId: dto.creditCardId,
      date: new Date(dto.date),
      description: dto.description,
    });
  }

  list(userId: string, filters: ListFilters) {
    return this.repo.list(userId, filters);
  }

  async findOne(userId: string, id: string) {
    const tx = await this.repo.findById(userId, id);
    if (!tx) throw new NotFoundError('Transação');
    return tx;
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    await this.findOne(userId, id);
    const data: any = { ...dto };
    if (dto.value !== undefined) data.value = Money.fromNumber(dto.value).amount;
    if (dto.date) data.date = new Date(dto.date);
    return this.repo.update(userId, id, data);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.repo.softDelete(userId, id);
  }

  summary(userId: string, from: string, to: string) {
    return this.repo.summary(userId, from, to);
  }
}
