export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface ListFilters {
  type?: 'income' | 'expense';
  categoryId?: string;
  from?: string;
  to?: string;
  q?: string;
  page: number;
  limit: number;
}

export interface TransactionRepository {
  create(userId: string, data: any): Promise<any>;
  findById(userId: string, id: string): Promise<any | null>;
  list(userId: string, filters: ListFilters): Promise<{ items: any[]; total: number }>;
  update(userId: string, id: string, data: any): Promise<any>;
  softDelete(userId: string, id: string): Promise<void>;
  summary(userId: string, from: string, to: string): Promise<{ income: number; expense: number }>;
}
