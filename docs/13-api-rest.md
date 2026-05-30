# 13 — API REST

- **Base URL:** `https://api.finlytics.app/v1`
- **Formato:** JSON. **Auth:** `Authorization: Bearer <accessToken>`.
- **Versionamento:** prefixo `/v1`. **Erros:** envelope padrão. **Paginação:** `?page=&limit=` (cursor onde necessário).
- **Docs interativas:** Swagger em `/docs` (OpenAPI 3).

## Envelope de erro
```json
{
  "statusCode": 400,
  "error": "ValidationError",
  "message": ["value must be greater than 0"],
  "path": "/v1/transactions",
  "timestamp": "2026-05-30T12:00:00Z",
  "traceId": "abc123"
}
```

## Auth
| Método | Rota | Descrição | Body | Resposta |
|--------|------|-----------|------|----------|
| POST | `/auth/register` | Cria conta | name, lastName, email, phone, password | 201 user (sem hash) |
| POST | `/auth/login` | Login | email, password | 200 {accessToken, refreshToken, user} |
| POST | `/auth/refresh` | Renova tokens | refreshToken | 200 {accessToken, refreshToken} |
| POST | `/auth/logout` | Revoga refresh | refreshToken | 204 |
| POST | `/auth/forgot-password` | Solicita reset | email | 200 (genérico) |
| POST | `/auth/reset-password` | Define nova senha | token, password | 200 |
| POST | `/auth/verify-email` | Verifica e-mail | token | 200 |
| POST | `/auth/mfa/enable` | Ativa MFA | — | 200 {otpauthUrl, secret} |
| POST | `/auth/mfa/verify` | Confirma MFA | code | 200 |

### Exemplo — Login
```http
POST /v1/auth/login
{ "email": "lucas@email.com", "password": "S3nh@Forte" }
```
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "def50200...",
  "user": { "id": "uuid", "name": "Lucas", "plan": "free" }
}
```

## Transactions (CRUD)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/transactions` | Lista (filtros: `type, categoryId, cardId, from, to, q, sort, page, limit`) |
| GET | `/transactions/:id` | Detalhe |
| POST | `/transactions` | Cria (income/expense) |
| PATCH | `/transactions/:id` | Edita |
| DELETE | `/transactions/:id` | Exclui (soft) |
| GET | `/transactions/summary` | Agregados do período |

```http
POST /v1/transactions
{ "type":"expense", "value":32.00, "categoryId":"uuid", "date":"2026-05-29", "description":"Almoço", "creditCardId":"uuid" }
```

## Categories (CRUD)
`GET/POST/PATCH/DELETE /categories` — campos: name, type, color, icon. `GET /categories/defaults` retorna as padrão (Alimentação, Transporte, Saúde, Moradia, Lazer, Educação, Investimentos).

## Cards (CRUD)
`GET/POST/PATCH/DELETE /cards` — bank, brand, creditLimit, closingDay, dueDay. `GET /cards/:id/invoice` retorna fatura atual (usado/disponível, fechamento, vencimento).

## Budgets
`GET/POST/PATCH/DELETE /budgets` — categoryId, monthlyLimit, month, year. `GET /budgets/status?month=&year=` retorna consumo por categoria.

## Goals (CRUD)
`GET/POST/PATCH/DELETE /goals` — title, targetAmount, targetDate. `POST /goals/:id/contributions` registra aporte. `GET /goals/:id` inclui progresso (%) e aporte mensal sugerido.

## Investments (CRUD — Premium)
`GET/POST/PATCH/DELETE /investments` — assetType, ticker, quantity, averagePrice. Resposta inclui `currentPrice`, `invested`, `marketValue`, `profit`, `profitability`.

## NetWorth / Patrimônio (Premium)
| GET | `/networth` | patrimônio atual (ativos − passivos) |
| GET | `/networth/evolution?months=12` | série histórica de snapshots |

## Reports
| GET | `/reports/monthly?month=&year=` | relatório mensal |
| GET | `/reports/quarterly?quarter=&year=` | trimestral |
| GET | `/reports/yearly?year=` | anual |
| POST | `/reports/export` | gera PDF/Excel (`format`, `period`) → URL S3 |

## Alerts
`GET /alerts`, `PATCH /alerts/:id/read`, `POST /alerts/read-all`.

## Subscriptions
| GET | `/subscriptions/me` | plano atual |
| POST | `/subscriptions/verify` | valida recibo IAP (provider, receipt) |
| POST | `/subscriptions/cancel` | cancela renovação |
| POST | `/webhooks/store` | webhook App Store/Play (server-to-server) |

## LGPD
| POST | `/me/data-export` | solicita exportação (gera arquivo) |
| DELETE | `/me` | exclui conta e dados |

## Profile
`GET /me`, `PATCH /me` (nome, telefone, avatar, locale, preferências de tema/notificações).

## Health
`GET /health` (liveness), `GET /health/ready` (readiness — DB/Redis).

## Códigos de status
`200/201/204` sucesso · `400` validação · `401` não autenticado · `403` sem permissão/Premium · `404` não encontrado · `409` conflito · `422` regra de negócio · `429` rate limit · `500` erro interno.
