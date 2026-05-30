# Finlytics - setup local do backend + banco (Windows / PowerShell).
# Pre-requisitos: Docker Desktop em execucao, Node 20+ (use install-prereqs.ps1).
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "==> 1/5 Subindo Postgres + Redis (Docker)" -ForegroundColor Cyan
docker compose -f "$root\infra\docker-compose.yml" up -d

Write-Host "==> 2/5 Preparando backend (.env)" -ForegroundColor Cyan
Set-Location "$root\backend"
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }

Write-Host "==> 3/5 Instalando dependencias (npm install)" -ForegroundColor Cyan
npm install

Write-Host "==> 4/5 Prisma generate + migrate deploy" -ForegroundColor Cyan
npx prisma generate
Write-Host "   Aguardando o Postgres aceitar conexoes..."
do {
  Start-Sleep -Seconds 2
  $ready = docker exec finlytics-postgres pg_isready -U finlytics 2>$null
} until ($LASTEXITCODE -eq 0)
npx prisma migrate deploy

Write-Host ""
Write-Host "==> Pronto! Inicie a API com:" -ForegroundColor Green
Write-Host "    cd backend ; npm run start:dev" -ForegroundColor Green
Write-Host "    Swagger: http://localhost:3000/docs" -ForegroundColor Green
