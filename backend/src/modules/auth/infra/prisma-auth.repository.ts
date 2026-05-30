import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';
import { AuthRepository, CreateUserData } from '../domain/auth.repository';
import { DEFAULT_CATEGORIES } from '../../../../prisma/seed';

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email }, include: { subscription: true } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, include: { subscription: true } });
  }

  // Cria usuário + assinatura free + categorias padrão em uma transação.
  createUserWithDefaults(data: CreateUserData) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          passwordHash: data.passwordHash,
          subscription: { create: { plan: 'free', status: 'active' } },
          categories: {
            create: DEFAULT_CATEGORIES.map((c) => ({
              name: c.name,
              type: c.type,
              color: c.color,
              icon: c.icon,
              isDefault: true,
            })),
          },
        },
      });
      return user;
    });
  }

  async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    await this.prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  }

  findValidRefreshToken(tokenHash: string) {
    return this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  async revokeRefreshToken(tokenHash: string) {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllRefreshTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async savePasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    await this.prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
  }

  findValidResetToken(tokenHash: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  async markResetTokenUsed(id: string) {
    await this.prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
  }

  async updatePassword(userId: string, passwordHash: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }
}
