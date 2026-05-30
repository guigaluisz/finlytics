# Finlytics - instala os pre-requisitos no Windows via winget.
# Rode no PowerShell (como Administrador de preferencia).
# Programas: Docker Desktop (Postgres+Redis), Node.js LTS (API), Git.

Write-Host "==> Verificando winget..." -ForegroundColor Cyan
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Host "winget nao encontrado. Instale 'App Installer' pela Microsoft Store e rode de novo." -ForegroundColor Red
  exit 1
}

function Install-IfMissing($id, $cmd) {
  if (Get-Command $cmd -ErrorAction SilentlyContinue) {
    Write-Host "OK: $cmd ja instalado." -ForegroundColor Green
  } else {
    Write-Host "==> Instalando $id ..." -ForegroundColor Cyan
    winget install --id $id -e --accept-source-agreements --accept-package-agreements
  }
}

Install-IfMissing "Docker.DockerDesktop" "docker"
Install-IfMissing "OpenJS.NodeJS.LTS"    "node"
Install-IfMissing "Git.Git"              "git"

Write-Host ""
Write-Host "==> Concluido." -ForegroundColor Green
Write-Host "IMPORTANTE: o Docker Desktop pode exigir WSL2 e REINICIAR o PC na primeira vez." -ForegroundColor Yellow
Write-Host "Depois de reiniciar, abra o Docker Desktop uma vez e rode:  .\setup.ps1" -ForegroundColor Yellow
