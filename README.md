# Finlytics — App de Gestão Financeira Pessoal

Aplicativo mobile (iOS + Android) para controle completo de finanças pessoais: receitas, despesas, cartões de crédito, metas, investimentos e evolução patrimonial — com planos Free e Premium.

> **Stack:** Flutter (mobile) · NestJS + TypeScript (backend) · PostgreSQL · Redis · S3 · Docker/Kubernetes/AWS.

## Estrutura do repositório

```
.
├── docs/        # Artefatos de produto e engenharia (Fases 1–9 e entregas 1–17)
├── backend/     # API NestJS (Clean Architecture + DDD + CQRS)
├── mobile/      # App Flutter (Clean Architecture + MVVM + Feature-First)
└── infra/       # Docker Compose, IaC, scripts de operação
```

## Índice da documentação (`docs/`)

| # | Documento | Conteúdo |
|---|-----------|----------|
| 01 | [Visão Geral](docs/01-visao-geral.md) | Produto, proposta de valor, monetização, KPIs |
| 02 | [Personas](docs/02-personas.md) | 4 personas detalhadas |
| 03 | [Jornada do Usuário](docs/03-jornada-usuario.md) | Mapas de jornada ponta a ponta |
| 04 | [Casos de Uso](docs/04-casos-de-uso.md) | Catálogo completo de UCs |
| 05 | [Fluxos UX](docs/05-fluxos-ux.md) | Auth, onboarding, telas principais |
| 06 | [Wireframes (Mermaid)](docs/06-wireframes.md) | Wireframes textuais + diagramas |
| 07 | [Design System](docs/07-design-system.md) | Tokens, cores, tipografia, componentes |
| 08 | [Arquitetura Mobile](docs/08-arquitetura-mobile.md) | Flutter, Clean, MVVM, Feature-First |
| 09 | [Arquitetura Backend](docs/09-arquitetura-backend.md) | NestJS, DDD, SOLID, CQRS |
| 10 | [Arquitetura de Banco](docs/10-arquitetura-banco.md) | PostgreSQL, Redis, particionamento |
| 11 | [DER](docs/11-der.md) | Modelo entidade-relacionamento completo |
| 12 | [Diagramas C4](docs/12-c4.md) | Contexto, Container, Componente |
| 13 | [API REST](docs/13-api-rest.md) | Especificação de endpoints |
| 14 | [Estrutura de Pastas](docs/14-estrutura-pastas.md) | Mobile + Backend |
| 15 | [Plano de Sprints](docs/15-sprints.md) | Roadmap de desenvolvimento |
| 16 | [Checklist de Produção](docs/16-checklist-producao.md) | Go-live readiness |
| 17 | [Roadmap Futuro](docs/17-roadmap.md) | Evolução do produto |
| — | [Segurança & LGPD](docs/seguranca-lgpd.md) | JWT, MFA, criptografia, conformidade |
| — | [Testes & QA](docs/testes-qa.md) | Estratégia, cobertura ≥95% |
| — | [CI/CD](docs/ci-cd.md) | Pipelines GitHub Actions |

## Como rodar (resumo)

```bash
# Backend + infra
cd infra && docker compose up -d        # Postgres + Redis
cd ../backend && npm install
npx prisma migrate dev && npm run start:dev

# Mobile
cd ../mobile && flutter pub get && flutter run
```

Detalhes em [`backend/README.md`](backend/README.md) e [`mobile/README.md`](mobile/README.md).
