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
    const dto: any = { tipo: 'despesa', valor: 32.5, data: '2026-05-29', descricao: 'Almoço' };
    const res = await service.create('u1', dto);
    expect(res).toEqual({ id: 't1' });
    expect(repo.create).toHaveBeenCalledWith('u1', expect.objectContaining({ tipo: 'despesa', valor: 32.5 }));
  });

  it('rejeita valor menor ou igual a zero', () => {
    const dto: any = { tipo: 'despesa', valor: 0, data: '2026-05-29' };
    expect(() => service.create('u1', dto)).toThrow(BusinessRuleError);
  });

  it('findOne lança NotFound quando não existe', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.findOne('u1', 'x')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('update recalcula valor e exige posse', async () => {
    repo.findById.mockResolvedValue({ id: 't1', usuarioId: 'u1' });
    repo.update.mockResolvedValue({ id: 't1', valor: 50 });
    const res = await service.update('u1', 't1', { valor: 50 } as any);
    expect(res.valor).toBe(50);
    expect(repo.update).toHaveBeenCalled();
  });

  it('remove faz soft delete após validar existência', async () => {
    repo.findById.mockResolvedValue({ id: 't1' });
    await service.remove('u1', 't1');
    expect(repo.softDelete).toHaveBeenCalledWith('u1', 't1');
  });

  it('list delega ao repositório com os filtros', async () => {
    repo.list.mockResolvedValue({ itens: [], total: 0 });
    const filtros: any = { pagina: 1, limite: 20 };
    const res = await service.list('u1', filtros);
    expect(res).toEqual({ itens: [], total: 0 });
    expect(repo.list).toHaveBeenCalledWith('u1', filtros);
  });

  it('summary delega ao repositório', async () => {
    repo.summary.mockResolvedValue({ receitas: 100, despesas: 40 });
    const res = await service.summary('u1', '2026-05-01', '2026-05-31');
    expect(res.receitas).toBe(100);
    expect(repo.summary).toHaveBeenCalledWith('u1', '2026-05-01', '2026-05-31');
  });
});
