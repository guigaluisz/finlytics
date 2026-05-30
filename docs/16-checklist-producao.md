# 16 — Checklist de Produção (Go-Live Readiness)

## Engenharia & Qualidade
- [ ] Cobertura de testes ≥ 95% nos módulos core (unit + integração).
- [ ] Testes E2E dos fluxos críticos (auth, transação, assinatura) verdes.
- [ ] Lint/format/typecheck sem erros no CI.
- [ ] Code review obrigatório (2 aprovações em mudanças sensíveis).
- [ ] Feature flags para releases graduais.

## Segurança
- [ ] JWT com expiração curta + refresh rotativo + revogação.
- [ ] Senhas com Argon2id/bcrypt (cost adequado).
- [ ] MFA disponível; biometria no app.
- [ ] Rate limiting e proteção contra brute force.
- [ ] Criptografia em trânsito (TLS 1.2+) e em repouso (RDS/S3 KMS).
- [ ] Campos sensíveis criptografados (mfa_secret etc.).
- [ ] Secrets em vault/Secrets Manager (nunca no git).
- [ ] Headers de segurança (helmet), CORS restrito.
- [ ] Pentest/scan de dependências (SCA) sem vulnerabilidades críticas.
- [ ] Logs sem PII sensível; mascaramento.

## LGPD / Privacidade
- [ ] Política de Privacidade e Termos publicados e versionados.
- [ ] Consentimento registrado no cadastro.
- [ ] Exportação de dados do titular funcionando.
- [ ] Exclusão/anonimização de conta funcionando.
- [ ] Registro de tratamento e base legal documentados.
- [ ] DPO/contato de privacidade definido.

## Infraestrutura & Confiabilidade
- [ ] Banco Multi-AZ + réplicas de leitura.
- [ ] Backups automáticos + PITR + restauração testada.
- [ ] Autoscaling (HPA) configurado e testado em carga.
- [ ] Health checks (liveness/readiness) e graceful shutdown.
- [ ] CDN/edge para assets; gzip/brotli.
- [ ] Migrations idempotentes; rollback plan.
- [ ] Disaster Recovery: RTO/RPO definidos.

## Observabilidade
- [ ] Logs estruturados centralizados.
- [ ] Métricas (latência, erro, throughput) + dashboards.
- [ ] Tracing distribuído (traceId ponta a ponta).
- [ ] Alertas (PagerDuty/Opsgenie) para SLOs.
- [ ] Crash reporting no app (Sentry/Crashlytics).

## Performance
- [ ] p95 de API < 300ms nos endpoints críticos.
- [ ] Cold start do app < 2s; dashboard < 1s com cache.
- [ ] Índices validados com EXPLAIN; sem N+1.

## App Stores
- [ ] Listings (nome, descrição, screenshots, ícone) prontos.
- [ ] IAP configurados e aprovados (sandbox testado).
- [ ] Conformidade com guidelines (Apple/Google).
- [ ] Suporte a versões mínimas (iOS 14 / Android 8).
- [ ] Política de privacidade vinculada nas lojas (App Privacy / Data Safety).

## Operação
- [ ] Runbooks de incidentes.
- [ ] Status page.
- [ ] Suporte ao cliente (canal + SLA).
- [ ] On-call e escalonamento definidos.
