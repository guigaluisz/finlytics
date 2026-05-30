import { TransactionsService } from './transactions.service';
import { NotFoundError, BusinessRuleError } from '../../../common/errors/domain.error';

describe('TransactionsService', () => {
  const repo = {
    create: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    summary: jest.fn(),
  } as any;
  let service: TransactionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TransactionsService(repo);
  });

  it('cria despesa válida normalizando o valor', async () => {
    repo.create.mockResolvedValue({ id: 't1' });
    const dto: any = { type: 'expense', value: 32.5, date: '2026-05-29', description: 'Almoço' };
    const res = await service.create('u1', dto);
    expect(res).toEqual({ id: 't1' });
    expect(repo.create).toHaveBeenCalledWith('u1', expect.objectContaining({ type: 'expense', value: 32.5 }));
  });

  it('rejeita valor menor ou igual a zero', () => {
    const dto: any = { type: 'expense', value: 0, date: '2026-05-29' };
    // create() valida o valor de forma síncrona (lança antes de retornar a Promise)
    expect(() => service.create('u1', dto)).toThrow(BusinessRuleError);
  });

  it('findOne lança NotFound quando não existe', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.findOne('u1', 'x')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('update recalcula valor e exige posse', async () => {
    repo.findById.mockResolvedValue({ id: 't1', userId: 'u1' });
    repo.update.mockResolvedValue({ id: 't1', value: 50 });
    const res = await service.update('u1', 't1', { value: 50 } as any);
    expect(res.value).toBe(50);
    expect(repo.update).toHaveBeenCalled();
  });

  it('remove faz soft delete após validar existência', async () => {
    repo.findById.mockResolvedValue({ id: 't1' });
    await service.remove('u1', 't1');
    expect(repo.softDelete).toHaveBeenCalledWith('u1', 't1');
  });
  it('list delega ao repositório com os filtros', async () => {
    repo.list.mockResolvedValue({ items: [], total: 0 });
    const filters: any = { page: 1, limit: 20 };
    const res = await service.list('u1', filters);
    expect(res).toEqual({ items: [], total: 0 });
    expect(repo.list).toHaveBeenCalledWith('u1', filters);
  });

  it('summary delega ao repositório', async () => {
    repo.summary.mockResolvedValue({ income: 100, expense: 40 });
    const res = await service.summary('u1', '2026-05-01', '2026-05-31');
    expect(res.income).toBe(100);
    expect(repo.summary).toHaveBeenCalledWith('u1', '2026-05-01', '2026-05-31');
  });
});
