import { ConflictException, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
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
    private readonly senhas: PasswordService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existente = await this.repo.findByEmail(dto.email);
    if (existente) throw new ConflictException('E-mail já cadastrado');

    const senhaHash = await this.senhas.hash(dto.senha);
    const usuario = await this.repo.createUserWithDefaults({
      nome: dto.nome,
      sobrenome: dto.sobrenome,
      email: dto.email,
      telefone: dto.telefone,
      senhaHash,
    });
    return this.emitirTokens(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.repo.findByEmail(dto.email);
    if (!usuario) throw new UnauthorizedException('Credenciais inválidas');
    const ok = await this.senhas.verify(usuario.senhaHash, dto.senha);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');
    return this.emitirTokens(usuario);
  }

  async refresh(tokenAtualizacao: string) {
    const hash = this.hashToken(tokenAtualizacao);
    const registro = await this.repo.findValidRefreshToken(hash);
    if (!registro) throw new UnauthorizedException('Token de atualização inválido');
    await this.repo.revokeRefreshToken(hash); // rotação
    const usuario = await this.repo.findById(registro.usuarioId);
    if (!usuario) throw new UnauthorizedException('Usuário inválido');
    return this.emitirTokens(usuario);
  }

  async logout(tokenAtualizacao: string) {
    await this.repo.revokeRefreshToken(this.hashToken(tokenAtualizacao));
  }

  async forgotPassword(email: string) {
    const usuario = await this.repo.findByEmail(email);
    if (usuario) {
      const token = randomBytes(32).toString('hex');
      const expiraEm = new Date(Date.now() + 30 * 60 * 1000);
      await this.repo.savePasswordResetToken(usuario.id, this.hashToken(token), expiraEm);
      const base = process.env.APP_RESET_URL ?? 'finlytics://redefinir-senha';
      await this.mail.sendPasswordReset(usuario.email, `${base}?token=${token}`, token);
    }
    return { mensagem: 'Se existir uma conta, enviaremos instruções por e-mail.' };
  }

  async resetPassword(token: string, novaSenha: string) {
    const registro = await this.repo.findValidResetToken(this.hashToken(token));
    if (!registro) throw new UnauthorizedException('Token inválido ou expirado');
    const senhaHash = await this.senhas.hash(novaSenha);
    await this.repo.updatePassword(registro.usuarioId, senhaHash);
    await this.repo.markResetTokenUsed(registro.id);
    await this.repo.revokeAllRefreshTokens(registro.usuarioId);
    return { mensagem: 'Senha redefinida com sucesso.' };
  }

  private async emitirTokens(usuario: any) {
    const plano = usuario.assinatura?.plano ?? 'gratuito';
    const tokenAcesso = await this.jwt.signAsync(
      { sub: usuario.id, email: usuario.email, plano },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_TTL ?? '15m' },
    );
    const tokenAtualizacao = randomBytes(48).toString('hex');
    const expiraEm = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await this.repo.saveRefreshToken(usuario.id, this.hashToken(tokenAtualizacao), expiraEm);
    return {
      tokenAcesso,
      tokenAtualizacao,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, plano },
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
