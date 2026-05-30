# Finlytics - instala uma ferramenta visual para consultar o banco PostgreSQL.
# Recomendado para iniciantes: DBeaver Community.
# Rode no PowerShell:
#   .\install-db-viewer.ps1

$ErrorActionPreference = "Stop"

Write-Host "==> Verificando winget..." -ForegroundColor Cyan
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Host "winget nao encontrado." -ForegroundColor Red
  Write-Host "Instale o 'App Installer' pela Microsoft Store e rode este script novamente." -ForegroundColor Yellow
  exit 1
}

Write-Host "==> Verificando DBeaver..." -ForegroundColor Cyan
$possibleIds = @(
  "DBeaver.DBeaver.Community",
  "dbeaver.dbeaver"
)

$installed = $false
foreach ($id in $possibleIds) {
  $result = winget list --id $id -e 2>$null
  if ($LASTEXITCODE -eq 0 -and $result) {
    Write-Host "OK: DBeaver Community ja esta instalado. Pacote: $id" -ForegroundColor Green
    $installed = $true
    break
  }
}

if (-not $installed) {
  Write-Host "==> Atualizando fontes do winget..." -ForegroundColor Cyan
  winget source update

  Write-Host "==> Instalando DBeaver Community..." -ForegroundColor Cyan
  $success = $false

  foreach ($id in $possibleIds) {
    Write-Host "Tentando pacote: $id" -ForegroundColor DarkCyan
    winget install --id $id -e --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -eq 0) {
      $success = $true
      break
    }
  }

  if (-not $success) {
    Write-Host ""
    Write-Host "Nao consegui instalar automaticamente pelo winget." -ForegroundColor Red
    Write-Host "Abra este link e baixe a versao Windows Installer:" -ForegroundColor Yellow
    Write-Host "  https://dbeaver.io/download/"
    Write-Host ""
    Write-Host "Depois de instalar manualmente, use os dados de conexao abaixo." -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "==> Concluido." -ForegroundColor Green
Write-Host ""
Write-Host "Dados para conectar no banco Finlytics:" -ForegroundColor Cyan
Write-Host "  Tipo:      PostgreSQL"
Write-Host "  Host:      localhost"
Write-Host "  Porta:     5432"
Write-Host "  Database:  finlytics"
Write-Host "  Usuario:   finlytics"
Write-Host "  Senha:     finlytics"
Write-Host ""
Write-Host "Antes de conectar, suba o banco com:" -ForegroundColor Yellow
Write-Host "  .\setup.ps1"
Write-Host ""
Write-Host "Alternativa sem instalar programa visual:" -ForegroundColor Yellow
Write-Host "  cd backend"
Write-Host "  npm run prisma:studio"
Write-Host "  Depois abra o endereco que aparecer no terminal."
