# Segurança & LGPD

## Autenticação & Sessão
- **Senhas:** hash com **Argon2id** (fallback bcrypt cost 12). Nunca armazenadas em texto.
- **JWT (access token):** expiração curta (15 min), assinado (RS256/HS256), claims mínimas (`sub`, `plan`, `iat`, `exp`).
- **Refresh token:** opaco, armazenado **hasheado** no banco (`refresh_tokens.token_hash`), rotação a cada uso, revogação em logout e em "sair de todos os dispositivos". Detecção de reuso → revoga toda a família.
- **MFA:** TOTP (RFC 6238) opcional; segredo criptografado em repouso. Códigos de backup.
- **Biometria (app):** desbloqueio local via Face ID/Touch ID/Android Biometric; protege apenas acesso ao app, não substitui auth do servidor.

## Autorização
- Guards do Nest: `JwtAuthGuard`, `RolesGuard`, `PremiumGuard`.
- Isolamento por `user_id` em **todas** as queries (defense in depth; nunca confiar só no filtro de aplicação — validar posse do recurso).

## Proteção de dados
- **Em trânsito:** TLS 1.2+ obrigatório; HSTS.
- **Em repouso:** criptografia de disco (RDS/S3 com KMS).
- **Campos sensíveis:** `mfa_secret`, dados de pagamento → criptografia em nível de aplicação (envelope com KMS).
- **PII minimizada** em logs (mascaramento de e-mail, telefone, valores quando aplicável).

## Hardening da API
- **Rate limiting** (Redis): por IP e por usuário; limites mais rígidos em `/auth/*`.
- **Brute force:** backoff + bloqueio temporário após N tentativas.
- **Headers:** `helmet` (CSP, X-Frame-Options, etc.), CORS allowlist.
- **Validação/sanitização:** DTOs com class-validator; rejeição de payloads desconhecidos (`whitelist+forbidNonWhitelisted`).
- **Proteções:** contra SQL injection (Prisma parametrizado), mass assignment, IDOR (checagem de posse), SSRF (validar URLs externas).
- **Dependências:** SCA (npm audit/Snyk) no CI; atualização contínua.

## Auditoria & Logs
- Tabela `audit_logs` registra ações sensíveis (login, alteração de dados, exclusão, exportação) com `action`, `entity`, `ip`, `metadata`, `created_at`.
- Logs estruturados (Pino) com `traceId` ponta a ponta; retenção e centralização (CloudWatch/ELK).
- Alertas de segurança (logins anômalos, picos de erro 401/403).

## LGPD (Lei 13.709/2018)
- **Bases legais:** execução de contrato (prestação do serviço) e consentimento (marketing/recursos opcionais).
- **Consentimento:** registrado no cadastro (aceite de Termos + Política), versionado.
- **Direitos do titular implementados:**
  - **Acesso/portabilidade:** `POST /me/data-export` gera arquivo com todos os dados.
  - **Eliminação:** `DELETE /me` remove/anonimiza dados após período de carência (estornos/obrigações legais).
  - **Correção:** edição de perfil e dados.
  - **Revogação de consentimento:** desativar marketing/notificações.
- **Minimização:** coletar só o necessário (telefone opcional).
- **Retenção:** política definida por tipo de dado; anonimização ao excluir conta.
- **Subprocessadores:** lista mantida (AWS, provedor de e-mail, cotações, lojas).
- **Incidentes:** plano de resposta e notificação à ANPD/titulares quando aplicável.
- **DPO/Encarregado:** contato de privacidade publicado.
- **Privacy by design & by default:** segurança e privacidade desde o projeto; configurações padrão mais protetivas.

## Segredos & Configuração
- Variáveis sensíveis em **Secrets Manager**/vault, injetadas em runtime; `.env` apenas em dev (não versionado).
- Rotação periódica de chaves e segredos.
