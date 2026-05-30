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

  create(usuarioId: string, dto: CreateTransactionDto) {
    const valor = Money.fromNumber(dto.valor); // valida invariante (>0)
    return this.repo.create(usuarioId, {
      tipo: dto.tipo,
      valor: valor.amount,
      categoriaId: dto.categoriaId,
      cartaoId: dto.cartaoId,
      data: new Date(dto.data),
      descricao: dto.descricao,
    });
  }

  list(usuarioId: string, filtros: ListFilters) {
    return this.repo.list(usuarioId, filtros);
  }

  async findOne(usuarioId: string, id: string) {
    const tx = await this.repo.findById(usuarioId, id);
    if (!tx) throw new NotFoundError('Transação');
    return tx;
  }

  async update(usuarioId: string, id: string, dto: UpdateTransactionDto) {
    await this.findOne(usuarioId, id);
    const data: any = { ...dto };
    if (dto.valor !== undefined) data.valor = Money.fromNumber(dto.valor).amount;
    if (dto.data) data.data = new Date(dto.data);
    return this.repo.update(usuarioId, id, data);
  }

  async remove(usuarioId: string, id: string) {
    await this.findOne(usuarioId, id);
    await this.repo.softDelete(usuarioId, id);
  }

  summary(usuarioId: string, de: string, ate: string) {
    return this.repo.summary(usuarioId, de, ate);
  }
}
