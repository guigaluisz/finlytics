import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';
import { AuthRepository, CreateUserData } from '../domain/auth.repository';
import { DEFAULT_CATEGORIES } from '../../../../prisma/default-categories';

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email }, include: { assinatura: true } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, include: { assinatura: true } });
  }

  createUserWithDefaults(data: CreateUserData) {
    return this.prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          nome: data.nome,
          sobrenome: data.sobrenome,
          email: data.email,
          telefone: data.telefone,
          senhaHash: data.senhaHash,
          assinatura: { create: { plano: 'gratuito', status: 'ativa' } },
          categorias: {
            create: DEFAULT_CATEGORIES.map((c) => ({
              nome: c.nome, tipo: c.tipo, cor: c.cor, icone: c.icone, padrao: true,
            })),
          },
        },
        include: { assinatura: true },
      });
    });
  }

  async saveRefreshToken(usuarioId: string, tokenHash: string, expiraEm: Date) {
    await this.prisma.refreshToken.create({ data: { usuarioId, tokenHash, expiraEm } });
  }

  findValidRefreshToken(tokenHash: string) {
    return this.prisma.refreshToken.findFirst({
      where: { tokenHash, revogadoEm: null, expiraEm: { gt: new Date() } },
    });
  }

  async revokeRefreshToken(tokenHash: string) {
    await this.prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revogadoEm: new Date() } });
  }

  async revokeAllRefreshTokens(usuarioId: string) {
    await this.prisma.refreshToken.updateMany({ where: { usuarioId, revogadoEm: null }, data: { revogadoEm: new Date() } });
  }

  async savePasswordResetToken(usuarioId: string, tokenHash: string, expiraEm: Date) {
    await this.prisma.passwordResetToken.create({ data: { usuarioId, tokenHash, expiraEm } });
  }

  findValidResetToken(tokenHash: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, usadoEm: null, expiraEm: { gt: new Date() } },
    });
  }

  async markResetTokenUsed(id: string) {
    await this.prisma.passwordResetToken.update({ where: { id }, data: { usadoEm: new Date() } });
  }

  async updatePassword(usuarioId: string, senhaHash: string) {
    await this.prisma.user.update({ where: { id: usuarioId }, data: { senhaHash } });
  }
}
