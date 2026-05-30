-- Tabela de tokens de redefinição de senha (PT)
CREATE TABLE "tokens_redefinicao_senha" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "usuario_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expira_em"  TIMESTAMPTZ NOT NULL,
  "usado_em"   TIMESTAMPTZ,
  "criado_em"  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tokens_redefinicao_senha_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE
);
CREATE INDEX "tokens_redefinicao_senha_token_hash_idx" ON "tokens_redefinicao_senha" ("token_hash");
