import { AuthService } from './auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  const repo = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    createUserWithDefaults: jest.fn(),
    saveRefreshToken: jest.fn(),
    findValidRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
    revokeAllRefreshTokens: jest.fn(),
    savePasswordResetToken: jest.fn(),
    findValidResetToken: jest.fn(),
    markResetTokenUsed: jest.fn(),
    updatePassword: jest.fn(),
  } as any;
  const senhas = { hash: jest.fn().mockResolvedValue('h'), verify: jest.fn() } as any;
  const jwt = { signAsync: jest.fn().mockResolvedValue('acesso') } as any;
  const mail = { sendPasswordReset: jest.fn().mockResolvedValue({}) } as any;
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(repo, senhas, jwt, mail);
  });

  it('register rejeita e-mail duplicado', async () => {
    repo.findByEmail.mockResolvedValue({ id: '1' });
    await expect(
      service.register({ nome: 'A', email: 'a@a.com', senha: 'Aa1!aaaa' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('register cria usuário e emite tokens', async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.createUserWithDefaults.mockResolvedValue({ id: '1', nome: 'A', email: 'a@a.com', assinatura: { plano: 'gratuito' } });
    const res = await service.register({ nome: 'A', email: 'a@a.com', senha: 'Aa1!aaaa' } as any);
    expect(res.tokenAcesso).toBe('acesso');
    expect(res.tokenAtualizacao).toHaveLength(96);
    expect(res.usuario.plano).toBe('gratuito');
    expect(repo.saveRefreshToken).toHaveBeenCalled();
  });

  it('login com senha errada falha', async () => {
    repo.findByEmail.mockResolvedValue({ id: '1', senhaHash: 'h' });
    senhas.verify.mockResolvedValue(false);
    await expect(
      service.login({ email: 'a@a.com', senha: 'x' } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
