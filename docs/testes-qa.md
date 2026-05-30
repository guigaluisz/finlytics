# Testes & QA

Meta de cobertura: **≥ 95%** nos módulos core (domínio + aplicação). Pirâmide de testes: muitos unitários, integração moderada, E2E focado em fluxos críticos.

## Backend (NestJS)
- **Unitários (Jest):** entidades de domínio, value objects (Money), use cases/handlers (commands/queries), serviços. Repositórios mockados.
- **Integração:** controllers + Prisma contra Postgres efêmero (Testcontainers/DB de teste). Valida validação, guards, persistência.
- **E2E (supertest):** jornadas — register→login→criar transação→listar→summary; assinatura (validação de recibo mockada); LGPD export/delete.
- **Contrato:** schemas de request/response validados contra OpenAPI.
- **Carga:** k6/Artillery nos endpoints críticos (login, transactions, dashboard) — metas de p95.

### Exemplo de teste de use case
```ts
describe('CreateTransaction', () => {
  it('rejeita valor <= 0', async () => {
    await expect(handler.execute({ ...dto, value: 0 }))
      .rejects.toThrow(BusinessRuleError);
  });
  it('cria despesa e atualiza limite do cartão', async () => {
    repo.save.mockResolvedValue(tx);
    const res = await handler.execute(validExpenseDto);
    expect(res.type).toBe('expense');
    expect(cardRepo.incrementUsed).toHaveBeenCalled();
  });
});
```

## Mobile (Flutter)
- **Unit:** use cases, view models (notifiers), mappers, formatters (moeda/data), validators.
- **Widget:** componentes do Design System, telas de login/cadastro, lista de transações (estados loading/empty/error).
- **Integration/E2E (`integration_test`):** login → dashboard; novo lançamento → aparece na lista.
- **Golden tests:** consistência visual de componentes-chave (claro/escuro).
- Mock com **mocktail**; cobertura via `flutter test --coverage`.

## QA manual & exploratório
- Casos de teste por caso de uso (matriz de UCs do doc 04).
- Testes de acessibilidade (contraste, leitores de tela, fonte grande).
- Testes em dispositivos reais (iOS/Android, telas pequenas/grandes).
- Regressão antes de cada release.

## CI Gates
- Pipeline falha se: testes vermelhos, cobertura < limite, lint/typecheck com erro, vulnerabilidade crítica (SCA).
- Relatório de cobertura publicado por PR.

## Definição de Pronto (DoD)
Código + testes (cobertura atingida) + revisão aprovada + documentação atualizada + deploy em staging + critérios de aceite verificados.
