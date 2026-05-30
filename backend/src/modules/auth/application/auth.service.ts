import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { AUTH_REPOSITORY, AuthRepository } from '../domain/auth.repository';
import { PasswordService } from '../infra/password.service';
import { MailService } from '../../../infra/mail/mail.service';
import { RegisterDto, LoginDto } from '../presentation/dtos';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @Inject(AUTH_REPOSITORY) private readonly repo: AuthRepository,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) throw new ConflictException('E-mail já cadastrado');

    const passwordHash = await this.passwords.hash(dto.password);
    const user = await this.repo.createUserWithDefaults({
      name: dto.name,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
    });
    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.repo.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    const ok = await this.passwords.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    const hash = this.hashToken(refreshToken);
    const record = await this.repo.findValidRefreshToken(hash);
    if (!record) throw new UnauthorizedException('Refresh token inválido');
    await this.repo.revokeRefreshToken(hash); // rotação
    const user = await this.repo.findById(record.userId);
    if (!user) throw new UnauthorizedException('Usuário inválido');
    return this.issueTokens(user);
  }

  async logout(refreshToken: string) {
    await this.repo.revokeRefreshToken(this.hashToken(refreshToken));
  }

  /** Gera token de reset, persiste o hash e envia e-mail. Resposta sempre genérica. */
  async forgotPassword(email: string) {
    const user = await this.repo.findByEmail(email);
    if (user) {
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
      await this.repo.savePasswordResetToken(user.id, this.hashToken(token), expiresAt);
      const base = process.env.APP_RESET_URL ?? 'finlytics://reset-password';
      await this.mail.sendPasswordReset(user.email, `${base}?token=${token}`, token);
    }
    return { message: 'Se existir uma conta, enviaremos instruções por e-mail.' };
  }

  /** Valida o token, troca a senha e revoga todas as sessões. */
  async resetPassword(token: string, newPassword: string) {
    const record = await this.repo.findValidResetToken(this.hashToken(token));
    if (!record) throw new UnauthorizedException('Token inválido ou expirado');
    const passwordHash = await this.passwords.hash(newPassword);
    await this.repo.updatePassword(record.userId, passwordHash);
    await this.repo.markResetTokenUsed(record.id);
    await this.repo.revokeAllRefreshTokens(record.userId); // segurança
    return { message: 'Senha redefinida com sucesso.' };
  }

  private async issueTokens(user: any) {
    const plan = user.subscription?.plan ?? user.plan ?? 'free';
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, plan },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_TTL ?? '15m' },
    );
    const refreshToken = randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await this.repo.saveRefreshToken(user.id, this.hashToken(refreshToken), expiresAt);
    return { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, plan } };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
