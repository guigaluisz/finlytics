# Finlytics Mobile (Flutter)

App iOS/Android. Clean Architecture + MVVM (Riverpod) + Feature-First.
Sincronizado com a API em português (rotas `/autenticacao/...`, campos `email`/`senha`, etc.).

## Pré-requisitos
- Flutter SDK (canal stable). Verifique com `flutter doctor`.
- Para web: Google Chrome. Para Android: Android Studio + um emulador.
- O backend precisa estar rodando (`npm run start:dev`).

## URL da API (importante)
A base é configurável via `--dart-define=API_BASE=...`:
- **Web / iOS Simulator:** `http://localhost:3000/v1`
- **Emulador Android:** `http://10.0.2.2:3000/v1`  (10.0.2.2 = localhost do PC)
- **Celular físico:** `http://SEU_IP_LAN:3000/v1`

## Rodar — caminho rápido (Web, sem Android Studio)
```bash
flutter pub get
flutter run -d chrome --dart-define=API_BASE=http://localhost:3000/v1
```
Login já vem preenchido: lucas2@teste.com / Senha@123.

## Rodar no Android (emulador)
```bash
flutter pub get
flutter run --dart-define=API_BASE=http://10.0.2.2:3000/v1
```

## Testes
```bash
flutter test
```

Estrutura: `core/` (network, storage, theme, utils), `features/auth` (data/domain/presentation), `features/{dashboard,onboarding,...}`.
