# 11 — Diagrama Entidade-Relacionamento (DER)

Modelo completo. Cardinalidades: um usuário possui muitas transações, categorias, cartões, metas, investimentos e uma assinatura.

```mermaid
erDiagram
    USERS ||--o{ TRANSACTIONS : possui
    USERS ||--o{ CATEGORIES : cria
    USERS ||--o{ CREDIT_CARDS : possui
    USERS ||--o{ FINANCIAL_GOALS : define
    USERS ||--o{ INVESTMENTS : registra
    USERS ||--o{ BUDGETS : planeja
    USERS ||--o{ ACCOUNTS : possui
    USERS ||--o{ NET_WORTH_SNAPSHOTS : acumula
    USERS ||--o{ ALERTS : recebe
    USERS ||--|| SUBSCRIPTIONS : assina
    USERS ||--o{ REFRESH_TOKENS : tem
    USERS ||--o{ AUDIT_LOGS : gera
    CATEGORIES ||--o{ TRANSACTIONS : classifica
    CATEGORIES ||--o{ BUDGETS : limita
    CREDIT_CARDS ||--o{ TRANSACTIONS : registra
    ACCOUNTS ||--o{ TRANSACTIONS : movimenta
    FINANCIAL_GOALS ||--o{ GOAL_CONTRIBUTIONS : recebe

    USERS {
        uuid id PK
        string name
        string last_name
        string email UK
        string password_hash
        string phone
        string avatar_url
        string locale
        boolean email_verified
        boolean mfa_enabled
        string mfa_secret
        string onboarding_goal
        string income_range
        string risk_profile
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }
    ACCOUNTS {
        uuid id PK
        uuid user_id FK
        string name
        string type
        numeric balance
        string currency
        timestamptz created_at
    }
    CATEGORIES {
        uuid id PK
        uuid user_id FK
        string name
        string type
        string color
        string icon
        boolean is_default
        timestamptz created_at
        timestamptz deleted_at
    }
    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        uuid account_id FK
        uuid credit_card_id FK
        string type
        numeric value
        string description
        date date
        string recurrence
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }
    CREDIT_CARDS {
        uuid id PK
        uuid user_id FK
        string bank
        string brand
        numeric credit_limit
        smallint closing_day
        smallint due_day
        timestamptz created_at
        timestamptz deleted_at
    }
    BUDGETS {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        numeric monthly_limit
        smallint month
        smallint year
        timestamptz created_at
    }
    FINANCIAL_GOALS {
        uuid id PK
        uuid user_id FK
        string title
        numeric target_amount
        numeric current_amount
        date target_date
        string status
        timestamptz created_at
        timestamptz updated_at
    }
    GOAL_CONTRIBUTIONS {
        uuid id PK
        uuid goal_id FK
        numeric amount
        date date
        timestamptz created_at
    }
    INVESTMENTS {
        uuid id PK
        uuid user_id FK
        string asset_type
        string ticker
        numeric quantity
        numeric average_price
        numeric current_price
        string currency
        timestamptz updated_at
        timestamptz created_at
    }
    NET_WORTH_SNAPSHOTS {
        uuid id PK
        uuid user_id FK
        date snapshot_month
        numeric assets
        numeric liabilities
        numeric net_worth
        timestamptz created_at
    }
    ALERTS {
        uuid id PK
        uuid user_id FK
        string type
        string title
        string message
        boolean read
        timestamptz created_at
    }
    SUBSCRIPTIONS {
        uuid id PK
        uuid user_id FK
        string plan
        string status
        string provider
        string external_id
        timestamptz expiration_date
        timestamptz created_at
        timestamptz updated_at
    }
    REFRESH_TOKENS {
        uuid id PK
        uuid user_id FK
        string token_hash
        string device
        timestamptz expires_at
        timestamptz revoked_at
        timestamptz created_at
    }
    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string action
        string entity
        string entity_id
        jsonb metadata
        string ip
        timestamptz created_at
    }
```

## Dicionário (resumo de campos-chave)
- **transactions.type**: `income | expense`.
- **categories.type**: `income | expense | both`.
- **investments.asset_type**: `cdb | lci | lca | tesouro | fii | stock | etf | intl`.
- **subscriptions.plan**: `free | premium_monthly | premium_annual`; **status**: `active | trialing | past_due | canceled | expired`.
- **goals.status**: `active | completed | canceled`.
- **alerts.type**: `budget | invoice | goal | system`.

## DDL ilustrativo (trecho)
```sql
CREATE TABLE transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id   uuid REFERENCES categories(id) ON DELETE SET NULL,
  credit_card_id uuid REFERENCES credit_cards(id) ON DELETE SET NULL,
  type          varchar(10) NOT NULL CHECK (type IN ('income','expense')),
  value         numeric(14,2) NOT NULL CHECK (value > 0),
  description   varchar(255),
  date          date NOT NULL,
  recurrence    varchar(20),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);
CREATE INDEX idx_trx_user_date ON transactions (user_id, date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_trx_user_cat  ON transactions (user_id, category_id, date);
```
> Schema executável completo em [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma).
