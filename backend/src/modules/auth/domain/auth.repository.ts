export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface CreateUserData {
  name: string;
  lastName?: string;
  email: string;
  phone?: string;
  passwordHash: string;
}

export interface AuthRepository {
  findByEmail(email: string): Promise<any | null>;
  findById(id: string): Promise<any | null>;
  createUserWithDefaults(data: CreateUserData): Promise<any>;
  saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  findValidRefreshToken(tokenHash: string): Promise<any | null>;
  revokeRefreshToken(tokenHash: string): Promise<void>;
  revokeAllRefreshTokens(userId: string): Promise<void>;
  // password reset
  savePasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  findValidResetToken(tokenHash: string): Promise<any | null>;
  markResetTokenUsed(id: string): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}
