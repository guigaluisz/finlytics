# 10 — Arquitetura de Banco de Dados

## Tecnologias
- **PostgreSQL 15** (primário, OLTP) — Multi-AZ (RDS) em produção.
- **Redis** — cache de leitura (dashboard, cotações), filas (BullMQ), rate-limit.
- **S3** — relatórios PDF/Excel, exports LGPD, anexos.

## Convenções
- `snake_case` para tabelas/colunas; PKs `uuid` (gerado pela app/`gen_random_uuid()`).
- Timestamps `created_at`/`updated_at` (`timestamptz`), soft delete via `deleted_at` onde aplicável.
- Valores monetários em **`numeric(14,2)`** (nunca float).
- Enums via tipos PG ou colunas `varchar` com `CHECK`.
- Toda tabela de usuário tem `user_id` indexado para isolamento e consultas.

## Estratégia de índices
- FKs sempre indexadas.
- Índices compostos para padrões de consulta reais:
  - `transactions(user_id, date DESC)` — extrato.
  - `transactions(user_id, category_id, date)` — relatórios por categoria.
  - `transactions(user_id, type, date)` — somatórios receita/despesa.
- Índice parcial: `WHERE deleted_at IS NULL`.
- `pg_trgm` para busca textual em `description`.

## Particionamento & escala
- `transactions` particionada por **range mensal** (`date`) quando o volume crescer — facilita arquivamento e performance.
- Snapshots patrimoniais (`net_worth_snapshots`) crescem linearmente; índice por `(user_id, snapshot_month)`.
- Réplicas de leitura para relatórios pesados; queries de leitura podem ir à réplica.

## Cache (Redis) — chaves
| Chave | Conteúdo | TTL |
|-------|----------|-----|
| `dashboard:{userId}:{yyyymm}` | agregados do mês | 10 min / invalidação em escrita |
| `quote:{ticker}` | cotação atual | 15 min |
| `report:{userId}:{period}` | relatório serializado | 1 h |
| `ratelimit:{ip}` | contador | 1 min |

## Backup & retenção
- Snapshots automáticos diários (RDS) + PITR (point-in-time recovery).
- Retenção 30 dias; export mensal para S3 Glacier.
- Testes de restauração trimestrais.

## Estratégia de versionamento (migrations)
- **Prisma Migrate** como fonte da verdade do schema; cada mudança = migração versionada no git.
- Migrações **idempotentes e reversíveis** sempre que possível.
- Mudanças destrutivas em duas fases (expand/contract):
  1. **Expand:** adicionar coluna/tabela nova (nullable), código passa a escrever em ambas.
  2. **Migrar dados** (job de backfill).
  3. **Contract:** remover coluna antiga após deploy estável.
- Política: nunca renomear coluna em uso direto; nunca `DROP` em deploy de feature.
- Seeds versionados para categorias padrão e planos.

## Constraints & integridade
- `CHECK (value > 0)` em transações e aportes.
- `CHECK (type IN ('income','expense'))`.
- `UNIQUE (user_id, name)` em categorias.
- FKs com `ON DELETE CASCADE` para dados dependentes do usuário (respeitando LGPD na exclusão).
- `CHECK (closing_day BETWEEN 1 AND 31)`, `due_day` idem.
