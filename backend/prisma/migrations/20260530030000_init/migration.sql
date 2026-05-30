-- Finlytics — migration inicial (PT). Aplicar com: npx prisma migrate deploy (ou reset)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS (nomes de tipo internos em inglês; valores em português)
CREATE TYPE "TransactionType"    AS ENUM ('receita', 'despesa');
CREATE TYPE "CategoryType"       AS ENUM ('receita', 'despesa', 'ambos');
CREATE TYPE "AssetType"          AS ENUM ('cdb', 'lci', 'lca', 'tesouro', 'fii', 'acao', 'etf', 'internacional');
CREATE TYPE "GoalStatus"         AS ENUM ('ativa', 'concluida', 'cancelada');
CREATE TYPE "SubscriptionPlan"   AS ENUM ('gratuito', 'premium_mensal', 'premium_anual');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ativa', 'teste', 'atrasada', 'cancelada', 'expirada');
CREATE TYPE "AlertType"          AS ENUM ('orcamento', 'fatura', 'meta', 'sistema');

CREATE TABLE "usuarios" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nome"             VARCHAR(50) NOT NULL,
  "sobrenome"        VARCHAR(50),
  "email"            VARCHAR(160) NOT NULL,
  "senha_hash"       TEXT NOT NULL,
  "telefone"         VARCHAR(20),
  "foto_url"         TEXT,
  "idioma"           VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
  "email_verificado" BOOLEAN NOT NULL DEFAULT false,
  "mfa_ativo"        BOOLEAN NOT NULL DEFAULT false,
  "mfa_segredo"      TEXT,
  "objetivo"         VARCHAR(30),
  "faixa_renda"      VARCHAR(30),
  "perfil_risco"     VARCHAR(20),
  "criado_em"        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizado_em"    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "excluido_em"      TIMESTAMPTZ
);
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios" ("email");

CREATE TABLE "contas" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "usuario_id" UUID NOT NULL,
  "nome"       VARCHAR(60) NOT NULL,
  "tipo"       VARCHAR(20) NOT NULL,
  "saldo"      DECIMAL(14,2) NOT NULL DEFAULT 0,
  "moeda"      VARCHAR(3) NOT NULL DEFAULT 'BRL',
  "criado_em"  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "contas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE
);
CREATE INDEX "contas_usuario_id_idx" ON "contas" ("usuario_id");

CREATE TABLE "categorias" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "usuario_id" UUID NOT NULL,
  "nome"       VARCHAR(60) NOT NULL,
  "tipo"       "CategoryType" NOT NULL DEFAULT 'despesa',
  "cor"        VARCHAR(9) NOT NULL DEFAULT '#6B7280',
  "icone"      VARCHAR(40) NOT NULL DEFAULT 'tag',
  "padrao"     BOOLEAN NOT NULL DEFAULT false,
  "criado_em"  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "excluido_em" TIMESTAMPTZ,
  CONSTRAINT "categorias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "categorias_usuario_id_nome_key" ON "categorias" ("usuario_id", "nome");
CREATE INDEX "categorias_usuario_id_idx" ON "categorias" ("usuario_id");

CREATE TABLE "cartoes" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "usuario_id"     UUID NOT NULL,
  "banco"          VARCHAR(60) NOT NULL,
  "bandeira"       VARCHAR(30) NOT NULL,
  "limite"         DECIMAL(14,2) NOT NULL,
  "dia_fechamento" SMALLINT NOT NULL,
  "dia_vencimento" SMALLINT NOT NULL,
  "criado_em"      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "excluido_em"    TIMESTAMPTZ,
  CONSTRAINT "cartoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  CONSTRAINT "cartoes_dia_fechamento_check" CHECK ("dia_fechamento" BETWEEN 1 AND 31),
  CONSTRAINT "cartoes_dia_vencimento_check" CHECK ("dia_vencimento" BETWEEN 1 AND 31)
);
CREATE INDEX "cartoes_usuario_id_idx" ON "cartoes" ("usuario_id");

CREATE TABLE "transacoes" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "usuario_id"   UUID NOT NULL,
  "categoria_id" UUID,
  "conta_id"     UUID,
  "cartao_id"    UUID,
  "tipo"         "TransactionType" NOT NULL,
  "valor"        DECIMAL(14,2) NOT NULL,
  "descricao"    VARCHAR(255),
  "data"         DATE NOT NULL,
  "recorrencia"  VARCHAR(20),
  "criado_em"    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "excluido_em"  TIMESTAMPTZ,
  CONSTRAINT "transacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  CONSTRAINT "transacoes_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL,
  CONSTRAINT "transacoes_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "contas"("id") ON DELETE SET NULL,
  CONSTRAINT "transacoes_cartao_id_fkey" FOREIGN KEY ("cartao_id") REFERENCES "cartoes"("id") ON DELETE SET NULL,
  CONSTRAINT "transacoes_valor_check" CHECK ("valor" > 0)
);
CREATE INDEX "transacoes_usuario_id_data_idx" ON "transacoes" ("usuario_id", "data");
CREATE INDEX "transacoes_usuario_id_categoria_id_data_idx" ON "transacoes" ("usuario_id", "categoria_id", "data");
CREATE INDEX "transacoes_usuario_id_tipo_data_idx" ON "transacoes" ("usuario_id", "tipo", "data");

CREATE TABLE "orcamentos" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "usuario_id"    UUID NOT NULL,
  "categoria_id"  UUID NOT NULL,
  "limite_mensal" DECIMAL(14,2) NOT NULL,
  "mes"           SMALLINT NOT NULL,
  "ano"           SMALLINT NOT NULL,
  "criado_em"     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "orcamentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  CONSTRAINT "orcamentos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "orcamentos_usuario_id_categoria_id_mes_ano_key" ON "orcamentos" ("usuario_id", "categoria_id", "mes", "ano");
CREATE INDEX "orcamentos_usuario_id_idx" ON "orcamentos" ("usuario_id");

CREATE TABLE "metas" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "usuario_id"   UUID NOT NULL,
  "titulo"       VARCHAR(80) NOT NULL,
  "valor_alvo"   DECIMAL(14,2) NOT NULL,
  "valor_atual"  DECIMAL(14,2) NOT NULL DEFAULT 0,
  "data_alvo"    DATE NOT NULL,
  "status"       "GoalStatus" NOT NULL DEFAULT 'ativa',
  "criado_em"    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "metas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  CONSTRAINT "metas_valor_alvo_check" CHECK ("valor_alvo" > 0)
);
CREATE INDEX "metas_usuario_id_idx" ON "metas" ("usuario_id");

CREATE TABLE "aportes" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "meta_id"   UUID NOT NULL,
  "valor"     DECIMAL(14,2) NOT NULL,
  "data"      DATE NOT NULL,
  "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "aportes_meta_id_fkey" FOREIGN KEY ("meta_id") REFERENCES "metas"("id") ON DELETE CASCADE,
  CONSTRAINT "aportes_valor_check" CHECK ("valor" > 0)
);
CREATE INDEX "aportes_meta_id_idx" ON "aportes" ("meta_id");

CREATE TABLE "investimentos" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "usuario_id"   UUID NOT NULL,
  "tipo_ativo"   "AssetType" NOT NULL,
  "ticker"       VARCHAR(20) NOT NULL,
  "quantidade"   DECIMAL(18,6) NOT NULL,
  "preco_medio"  DECIMAL(18,6) NOT NULL,
  "preco_atual"  DECIMAL(18,6),
  "moeda"        VARCHAR(3) NOT NULL DEFAULT 'BRL',
  "criado_em"    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "investimentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  CONSTRAINT "investimentos_quantidade_check" CHECK ("quantidade" > 0)
);
CREATE INDEX "investimentos_usuario_id_idx" ON "investimentos" ("usuario_id");
CREATE INDEX "investimentos_usuario_id_tipo_ativo_idx" ON "investimentos" ("usuario_id", "tipo_ativo");

CREATE TABLE "snapshots_patrimonio" (
  "id"                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "usuario_id"         UUID NOT NULL,
  "mes_referencia"     DATE NOT NULL,
  "ativos"             DECIMAL(16,2) NOT NULL,
  "passivos"           DECIMAL(16,2) NOT NULL,
  "patrimonio_liquido" DECIMAL(16,2) NOT NULL,
  "criado_em"          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "snapshots_patrimonio_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "snapshots_patrimonio_usuario_id_mes_referencia_key" ON "snapshots_patrimonio" ("usuario_id", "mes_referencia");
CREATE INDEX "snapshots_patrimonio_usuario_id_idx" ON "snapshots_patrimonio" ("usuario_id");

CREATE TABLE "alertas" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "usuario_id" UUID NOT NULL,
  "tipo"       "AlertType" NOT NULL,
  "titulo"     VARCHAR(120) NOT NULL,
  "mensagem"   VARCHAR(300) NOT NULL,
  "lida"       BOOLEAN NOT NULL DEFAULT false,
  "criado_em"  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "alertas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE
);
CREATE INDEX "alertas_usuario_id_lida_idx" ON "alertas" ("usuario_id", "lida");

CREATE TABLE "assinaturas" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "usuario_id"     UUID NOT NULL,
  "plano"          "SubscriptionPlan" NOT NULL DEFAULT 'gratuito',
  "status"         "SubscriptionStatus" NOT NULL DEFAULT 'ativa',
  "provedor"       VARCHAR(20),
  "id_externo"     TEXT,
  "data_expiracao" TIMESTAMPTZ,
  "criado_em"      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizado_em"  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "assinaturas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "assinaturas_usuario_id_key" ON "assinaturas" ("usuario_id");

CREATE TABLE "tokens_atualizacao" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "usuario_id"  UUID NOT NULL,
  "token_hash"  TEXT NOT NULL,
  "dispositivo" VARCHAR(120),
  "expira_em"   TIMESTAMPTZ NOT NULL,
  "revogado_em" TIMESTAMPTZ,
  "criado_em"   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tokens_atualizacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE
);
CREATE INDEX "tokens_atualizacao_usuario_id_idx" ON "tokens_atualizacao" ("usuario_id");
CREATE INDEX "tokens_atualizacao_token_hash_idx" ON "tokens_atualizacao" ("token_hash");

CREATE TABLE "logs_auditoria" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "usuario_id"  UUID,
  "acao"        VARCHAR(60) NOT NULL,
  "entidade"    VARCHAR(60),
  "entidade_id" VARCHAR(60),
  "metadados"   JSONB,
  "ip"          VARCHAR(45),
  "criado_em"   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "logs_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL
);
CREATE INDEX "logs_auditoria_usuario_id_idx" ON "logs_auditoria" ("usuario_id");
CREATE INDEX "logs_auditoria_acao_idx" ON "logs_auditoria" ("acao");
