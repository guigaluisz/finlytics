# Finlytics API (NestJS)

API de gestão financeira pessoal. Clean Architecture + DDD + SOLID, Repository Pattern e CQRS onde agrega valor.

## Requisitos
- Node 20+, Docker (Postgres + Redis).

## Setup rápido (recomendado)
Da raiz do projeto:
```bash
./setup.sh        # sobe infra, instala deps, aplica migrations
cd backend && npm run start:dev
```

## Setup manual
```bash
cp .env.example .env
cd ../infra && docker compose up -d && cd ../backend   # Postgres :5432, Redis :6379
npm install
npx prisma generate
npx prisma migrate deploy      # aplica a migration inicial (cria todas as tabelas)
npm run start:dev              # http://localhost:3000  | Swagger: /docs
```

> Alternativa sem Prisma: rodar o SQL direto
> `docker exec -i finlytics-postgres psql -U finlytics -d finlytics < prisma/migrations/20260530030000_init/migration.sql`

## Migrations
- A migration inicial está em `prisma/migrations/20260530030000_init/migration.sql` (14 tabelas, 7 enums, índices, FKs e CHECKs).
- Para evoluir o schema: edite `prisma/schema.prisma` e rode `npx prisma migrate dev --name <mudanca>`.
- Em produção/staging: `npx prisma migrate deploy`.

## Scripts (ou use o Makefile: `make up`, `make deploy`, `make dev`, `make test`)
- `npm run start:dev` — dev com watch
- `npm test` / `npm run test:cov` — testes + cobertura
- `npm run test:e2e` — testes e2e
- `npm run prisma:studio` — explorar o banco

## Estrutura
`src/modules/*` (auth, users, transactions, categories, cards, goals, investments, reports, subscriptions),
`src/common` (guards/filters/interceptors/decorators), `src/infra` (prisma/redis/s3/queue), `prisma/schema.prisma`.

Veja `../docs/09-arquitetura-backend.md` e `../docs/13-api-rest.md`.
