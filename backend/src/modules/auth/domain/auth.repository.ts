export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface CreateUserData {
  nome: string;
  sobrenome?: string;
  email: string;
  telefone?: string;
  senhaHash: string;
}

export interface AuthRepository {
  findByEmail(email: string): Promise<any | null>;
  findById(id: string): Promise<any | null>;
  createUserWithDefaults(data: CreateUserData): Promise<any>;
  saveRefreshToken(usuarioId: string, tokenHash: string, expiraEm: Date): Promise<void>;
  findValidRefreshToken(tokenHash: string): Promise<any | null>;
  revokeRefreshToken(tokenHash: string): Promise<void>;
  revokeAllRefreshTokens(usuarioId: string): Promise<void>;
  savePasswordResetToken(usuarioId: string, tokenHash: string, expiraEm: Date): Promise<void>;
  findValidResetToken(tokenHash: string): Promise<any | null>;
  markResetTokenUsed(id: string): Promise<void>;
  updatePassword(usuarioId: string, senhaHash: string): Promise<void>;
}
