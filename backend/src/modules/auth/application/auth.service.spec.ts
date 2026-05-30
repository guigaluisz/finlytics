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
  const passwords = { hash: jest.fn().mockResolvedValue('h'), verify: jest.fn() } as any;
  const jwt = { signAsync: jest.fn().mockResolvedValue('access') } as any;
  const mail = { sendPasswordReset: jest.fn().mockResolvedValue({}) } as any;
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(repo, passwords, jwt, mail);
  });

  it('register rejeita e-mail duplicado', async () => {
    repo.findByEmail.mockResolvedValue({ id: '1' });
    await expect(
      service.register({ name: 'A', email: 'a@a.com', password: 'Aa1!aaaa' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('register cria usuário e emite tokens', async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.createUserWithDefaults.mockResolvedValue({ id: '1', name: 'A', email: 'a@a.com', plan: 'free' });
    const res = await service.register({ name: 'A', email: 'a@a.com', password: 'Aa1!aaaa' } as any);
    expect(res.accessToken).toBe('access');
    expect(res.refreshToken).toHaveLength(96);
    expect(repo.saveRefreshToken).toHaveBeenCalled();
  });

  it('login com senha errada falha', async () => {
    repo.findByEmail.mockResolvedValue({ id: '1', passwordHash: 'h' });
    passwords.verify.mockResolvedValue(false);
    await expect(
      service.login({ email: 'a@a.com', password: 'x' } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
