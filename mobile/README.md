# Finlytics Mobile (Flutter)

App iOS/Android. Clean Architecture + MVVM (Riverpod) + Feature-First.

## Setup
```bash
flutter pub get
flutter run            # dispositivo/emulador
flutter test           # testes unitários e de widget
flutter test integration_test   # E2E
```

## Arquitetura
- `core/` — config, network (Dio), storage seguro, theme (Design System), utils, usecase base.
- `shared/widgets/` — componentes reutilizáveis do DS.
- `services/` — biometria, push, compras (IAP), analytics.
- `features/<nome>/` — `data` (datasources/models/repos), `domain` (entities/usecases/ports), `presentation` (pages/widgets/viewmodels).

A feature `auth` está implementada ponta a ponta como referência. As demais (dashboard, transactions, onboarding) têm telas iniciais. Veja `../docs/08-arquitetura-mobile.md`.
