# CI/CD

Pipelines em GitHub Actions, acionados por push/PR.

## Backend (`.github/workflows/backend-ci.yml`)
Sobe **Postgres** e **Redis** como serviços e executa, em sequência:
1. `npm install`
2. `npx prisma generate` + `npx prisma migrate deploy` (banco de teste)
3. `npm run lint` (ESLint + Prettier)
4. `npm run build` (compilação TypeScript)
5. `npm run test:cov` (unitários + cobertura, com thresholds nos módulos core)
6. `npm run test:e2e` (integração ponta a ponta)
7. Publica o relatório de cobertura como artefato.

Variáveis de ambiente são injetadas no job; segredos reais ficam em **GitHub Secrets** (não no repositório).

## Mobile (`.github/workflows/mobile-ci.yml`)
1. `flutter pub get`
2. `flutter analyze`
3. `flutter test --coverage`

## Qualidade
- **Lint/format:** ESLint + Prettier (`.eslintrc.js`, `.prettierrc`).
- **Cobertura:** thresholds configurados em `backend/package.json` (`jest.coverageThreshold`) para a lógica de domínio/aplicação; meta de evolução até 95% nos módulos core.
- **Dependabot:** atualizações semanais de npm, pub e GitHub Actions.

## Deploy (sugestão de evolução)
Adicionar um job de `deploy` (em `main`) que constrói a imagem via `backend/Dockerfile`, publica no registry (ECR/GHCR) e aplica no Kubernetes (`infra/k8s`).
