# Finlytics - instala o Flutter SDK (canal stable) e adiciona ao PATH.
# Pré-requisito: Git (instalado pelo install-prereqs.ps1).
# Rode no PowerShell normal (NÃO precisa ser admin).
$ErrorActionPreference = "Stop"

$flutterDir = Join-Path $env:USERPROFILE "flutter"
$flutterBin = Join-Path $flutterDir "bin"

Write-Host "==> Verificando Git..." -ForegroundColor Cyan
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git nao encontrado. Rode primeiro:  .\install-prereqs.ps1" -ForegroundColor Red
  exit 1
}

if (Test-Path (Join-Path $flutterBin "flutter.bat")) {
  Write-Host "OK: Flutter ja existe em $flutterDir" -ForegroundColor Green
} else {
  Write-Host "==> Baixando o Flutter (canal stable) em $flutterDir" -ForegroundColor Cyan
  Write-Host "    (pode levar alguns minutos - o repositorio e grande)" -ForegroundColor Yellow
  git clone -b stable https://github.com/flutter/flutter.git "$flutterDir"
}

Write-Host "==> Adicionando o Flutter ao PATH do usuario..." -ForegroundColor Cyan
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$flutterBin*") {
  [Environment]::SetEnvironmentVariable("Path", "$userPath;$flutterBin", "User")
  Write-Host "    Adicionado: $flutterBin" -ForegroundColor Green
} else {
  Write-Host "    Ja estava no PATH." -ForegroundColor Green
}
# disponibiliza nesta sessao tambem
$env:Path = "$env:Path;$flutterBin"

Write-Host "==> Habilitando suporte a Web..." -ForegroundColor Cyan
& "$flutterBin\flutter.bat" config --enable-web | Out-Null

Write-Host "==> Versao instalada:" -ForegroundColor Cyan
& "$flutterBin\flutter.bat" --version

Write-Host ""
Write-Host "==> Diagnostico (flutter doctor):" -ForegroundColor Cyan
& "$flutterBin\flutter.bat" doctor

Write-Host ""
Write-Host "==> Pronto! FECHE este PowerShell e abra um NOVO (para o PATH valer)." -ForegroundColor Green
Write-Host "Depois, com o backend rodando, execute:" -ForegroundColor Green
Write-Host '    cd "E:\Projetos Guilherme\Aplicativo de Financas\mobile"' -ForegroundColor Green
Write-Host "    flutter pub get" -ForegroundColor Green
Write-Host "    flutter run -d chrome --dart-define=API_BASE=http://localhost:3000/v1" -ForegroundColor Green
