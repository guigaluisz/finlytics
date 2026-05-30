# 14 — Estrutura de Pastas

## Backend (NestJS)
```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/                  # configuração tipada + validação env
│   ├── common/                  # guards, filters, interceptors, decorators, pipes
│   ├── infra/                   # prisma, redis, s3, queue, mail
│   └── modules/
│       ├── auth/ ├ application ├ domain ├ infra ├ presentation
│       ├── users/
│       ├── transactions/
│       ├── categories/
│       ├── cards/
│       ├── budgets/
│       ├── goals/
│       ├── investments/
│       ├── networth/
│       ├── reports/
│       ├── alerts/
│       ├── subscriptions/
│       └── lgpd/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── test/                        # e2e
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

## Mobile (Flutter)
```
mobile/
├── lib/
│   ├── main.dart
│   ├── app/                     # app root + router + bootstrap
│   ├── core/                    # config, error, network, storage, theme, utils, usecase
│   ├── shared/widgets/          # design system components
│   ├── services/                # analytics, notifications, biometrics, purchases
│   └── features/
│       ├── auth/ ├ data ├ domain ├ presentation
│       ├── onboarding/
│       ├── dashboard/
│       ├── transactions/
│       ├── categories/
│       ├── cards/
│       ├── goals/
│       ├── investments/
│       ├── reports/
│       ├── budget/
│       ├── subscription/
│       └── profile/
├── test/
├── integration_test/
└── pubspec.yaml
```

## Infra
```
infra/
├── docker-compose.yml           # postgres + redis (dev)
├── k8s/                         # manifests (deployment, service, hpa, ingress)
└── README.md
```
