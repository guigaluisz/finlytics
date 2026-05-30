-- Finlytics — migration inicial (cria todo o schema)
-- Aplicar com: npx prisma migrate deploy   (ou rodar este SQL via psql)

-- Extensão para gen_random_uuid() (nativa no PostgreSQL 13+; pgcrypto como fallback)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================== ENUMS ======================
CREATE TYPE "TransactionType"   AS ENUM ('income', 'expense');
CREATE TYPE "CategoryType"      AS ENUM ('income', 'expense', 'both');
CREATE TYPE "AssetType"         AS ENUM ('cdb', 'lci', 'lca', 'tesouro', 'fii', 'stock', 'etf', 'intl');
CREATE TYPE "GoalStatus"        AS ENUM ('active', 'completed', 'canceled');
CREATE TYPE "SubscriptionPlan"  AS ENUM ('free', 'premium_monthly', 'premium_annual');
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'expired');
CREATE TYPE "AlertType"         AS ENUM ('budget', 'invoice', 'goal', 'system');

-- ====================== USERS ======================
CREATE TABLE "users" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"            VARCHAR(50) NOT NULL,
  "last_name"       VARCHAR(50),
  "email"           VARCHAR(160) NOT NULL,
  "password_hash"   TEXT NOT NULL,
  "phone"           VARCHAR(20),
  "avatar_url"      TEXT,
  "locale"          VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
  "email_verified"  BOOLEAN NOT NULL DEFAULT false,
  "mfa_enabled"     BOOLEAN NOT NULL DEFAULT false,
  "mfa_secret"      TEXT,
  "onboarding_goal" VARCHAR(30),
  "income_range"    VARCHAR(30),
  "risk_profile"    VARCHAR(20),
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at"      TIMESTAMPTZ
);
CREATE UNIQUE INDEX "users_email_key" ON "users" ("email");

-- ====================== ACCOUNTS ======================
CREATE TABLE "accounts" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"    UUID NOT NULL,
  "name"       VARCHAR(60) NOT NULL,
  "type"       VARCHAR(20) NOT NULL,
  "balance"    DECIMAL(14,2) NOT NULL DEFAULT 0,
  "currency"   VARCHAR(3) NOT NULL DEFAULT 'BRL',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "accounts_user_id_idx" ON "accounts" ("user_id");

-- ====================== CATEGORIES ======================
CREATE TABLE "categories" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"    UUID NOT NULL,
  "name"       VARCHAR(60) NOT NULL,
  "type"       "CategoryType" NOT NULL DEFAULT 'expense',
  "color"      VARCHAR(9) NOT NULL DEFAULT '#6B7280',
  "icon"       VARCHAR(40) NOT NULL DEFAULT 'tag',
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "categories_user_id_name_key" ON "categories" ("user_id", "name");
CREATE INDEX "categories_user_id_idx" ON "categories" ("user_id");

-- ====================== CREDIT_CARDS ======================
CREATE TABLE "credit_cards" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"      UUID NOT NULL,
  "bank"         VARCHAR(60) NOT NULL,
  "brand"        VARCHAR(30) NOT NULL,
  "credit_limit" DECIMAL(14,2) NOT NULL,
  "closing_day"  SMALLINT NOT NULL,
  "due_day"      SMALLINT NOT NULL,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at"   TIMESTAMPTZ,
  CONSTRAINT "credit_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "credit_cards_closing_day_check" CHECK ("closing_day" BETWEEN 1 AND 31),
  CONSTRAINT "credit_cards_due_day_check" CHECK ("due_day" BETWEEN 1 AND 31)
);
CREATE INDEX "credit_cards_user_id_idx" ON "credit_cards" ("user_id");

-- ====================== TRANSACTIONS ======================
CREATE TABLE "transactions" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"        UUID NOT NULL,
  "category_id"    UUID,
  "account_id"     UUID,
  "credit_card_id" UUID,
  "type"           "TransactionType" NOT NULL,
  "value"          DECIMAL(14,2) NOT NULL,
  "description"    VARCHAR(255),
  "date"           DATE NOT NULL,
  "recurrence"     VARCHAR(20),
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at"     TIMESTAMPTZ,
  CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL,
  CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL,
  CONSTRAINT "transactions_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "credit_cards"("id") ON DELETE SET NULL,
  CONSTRAINT "transactions_value_check" CHECK ("value" > 0)
);
CREATE INDEX "transactions_user_id_date_idx" ON "transactions" ("user_id", "date");
CREATE INDEX "transactions_user_id_category_id_date_idx" ON "transactions" ("user_id", "category_id", "date");
CREATE INDEX "transactions_user_id_type_date_idx" ON "transactions" ("user_id", "type", "date");

-- ====================== BUDGETS ======================
CREATE TABLE "budgets" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"       UUID NOT NULL,
  "category_id"   UUID NOT NULL,
  "monthly_limit" DECIMAL(14,2) NOT NULL,
  "month"         SMALLINT NOT NULL,
  "year"          SMALLINT NOT NULL,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "budgets_user_id_category_id_month_year_key" ON "budgets" ("user_id", "category_id", "month", "year");
CREATE INDEX "budgets_user_id_idx" ON "budgets" ("user_id");

-- ====================== FINANCIAL_GOALS ======================
CREATE TABLE "financial_goals" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"        UUID NOT NULL,
  "title"          VARCHAR(80) NOT NULL,
  "target_amount"  DECIMAL(14,2) NOT NULL,
  "current_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "target_date"    DATE NOT NULL,
  "status"         "GoalStatus" NOT NULL DEFAULT 'active',
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "financial_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "financial_goals_target_amount_check" CHECK ("target_amount" > 0)
);
CREATE INDEX "financial_goals_user_id_idx" ON "financial_goals" ("user_id");

-- ====================== GOAL_CONTRIBUTIONS ======================
CREATE TABLE "goal_contributions" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "goal_id"    UUID NOT NULL,
  "amount"     DECIMAL(14,2) NOT NULL,
  "date"       DATE NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "goal_contributions_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "financial_goals"("id") ON DELETE CASCADE,
  CONSTRAINT "goal_contributions_amount_check" CHECK ("amount" > 0)
);
CREATE INDEX "goal_contributions_goal_id_idx" ON "goal_contributions" ("goal_id");

-- ====================== INVESTMENTS ======================
CREATE TABLE "investments" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"       UUID NOT NULL,
  "asset_type"    "AssetType" NOT NULL,
  "ticker"        VARCHAR(20) NOT NULL,
  "quantity"      DECIMAL(18,6) NOT NULL,
  "average_price" DECIMAL(18,6) NOT NULL,
  "current_price" DECIMAL(18,6),
  "currency"      VARCHAR(3) NOT NULL DEFAULT 'BRL',
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "investments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "investments_quantity_check" CHECK ("quantity" > 0)
);
CREATE INDEX "investments_user_id_idx" ON "investments" ("user_id");
CREATE INDEX "investments_user_id_asset_type_idx" ON "investments" ("user_id", "asset_type");

-- ====================== NET_WORTH_SNAPSHOTS ======================
CREATE TABLE "net_worth_snapshots" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"        UUID NOT NULL,
  "snapshot_month" DATE NOT NULL,
  "assets"         DECIMAL(16,2) NOT NULL,
  "liabilities"    DECIMAL(16,2) NOT NULL,
  "net_worth"      DECIMAL(16,2) NOT NULL,
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "net_worth_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "net_worth_snapshots_user_id_snapshot_month_key" ON "net_worth_snapshots" ("user_id", "snapshot_month");
CREATE INDEX "net_worth_snapshots_user_id_idx" ON "net_worth_snapshots" ("user_id");

-- ====================== ALERTS ======================
CREATE TABLE "alerts" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"    UUID NOT NULL,
  "type"       "AlertType" NOT NULL,
  "title"      VARCHAR(120) NOT NULL,
  "message"    VARCHAR(300) NOT NULL,
  "read"       BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "alerts_user_id_read_idx" ON "alerts" ("user_id", "read");

-- ====================== SUBSCRIPTIONS ======================
CREATE TABLE "subscriptions" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"         UUID NOT NULL,
  "plan"            "SubscriptionPlan" NOT NULL DEFAULT 'free',
  "status"          "SubscriptionStatus" NOT NULL DEFAULT 'active',
  "provider"        VARCHAR(20),
  "external_id"     TEXT,
  "expiration_date" TIMESTAMPTZ,
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions" ("user_id");

-- ====================== REFRESH_TOKENS ======================
CREATE TABLE "refresh_tokens" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"    UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "device"     VARCHAR(120),
  "expires_at" TIMESTAMPTZ NOT NULL,
  "revoked_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" ("user_id");
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens" ("token_hash");

-- ====================== AUDIT_LOGS ======================
CREATE TABLE "audit_logs" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"    UUID,
  "action"     VARCHAR(60) NOT NULL,
  "entity"     VARCHAR(60),
  "entity_id"  VARCHAR(60),
  "metadata"   JSONB,
  "ip"         VARCHAR(45),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
);
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" ("user_id");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" ("action");
