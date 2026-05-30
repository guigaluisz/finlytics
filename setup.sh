#!/usr/bin/env bash
# Finlytics - setup local do backend + banco. Requer: Docker, Node 20+.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> 1/5 Subindo Postgres + Redis (Docker)"
docker compose -f "$ROOT/infra/docker-compose.yml" up -d

echo "==> 2/5 Preparando backend (.env)"
cd "$ROOT/backend"
[ -f .env ] || cp .env.example .env

echo "==> 3/5 Instalando dependências"
npm install

echo "==> 4/5 Gerando Prisma Client + aplicando migrations"
npx prisma generate
# aguarda o Postgres aceitar conexões
until docker exec finlytics-postgres pg_isready -U finlytics >/dev/null 2>&1; do
  echo "   aguardando Postgres..."; sleep 2;
done
npx prisma migrate deploy

echo "==> 5/5 Pronto! Inicie a API com:"
echo "    cd backend && npm run start:dev"
echo "    Swagger: http://localhost:3000/docs"
