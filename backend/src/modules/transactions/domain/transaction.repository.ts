export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface ListFilters {
  tipo?: 'receita' | 'despesa';
  categoriaId?: string;
  de?: string;
  ate?: string;
  busca?: string;
  pagina: number;
  limite: number;
}

export interface TransactionRepository {
  create(usuarioId: string, data: any): Promise<any>;
  findById(usuarioId: string, id: string): Promise<any | null>;
  list(usuarioId: string, filtros: ListFilters): Promise<{ itens: any[]; total: number }>;
  update(usuarioId: string, id: string, data: any): Promise<any>;
  softDelete(usuarioId: string, id: string): Promise<void>;
  summary(usuarioId: string, de: string, ate: string): Promise<{ receitas: number; despesas: number }>;
}
