# 05 — Fluxos UX Completos

Notação: setas = navegação; losangos = decisão. Todos os fluxos consideram estados de erro, loading e vazio.

## Mapa de navegação global

```mermaid
flowchart TD
    Splash --> Auth{Autenticado?}
    Auth -- Nao --> Welcome[Boas-vindas]
    Welcome --> Login & Cadastro
    Auth -- Sim --> Onb{Onboarding feito?}
    Onb -- Nao --> Onboarding
    Onb -- Sim --> Tabs[App - Bottom Tabs]
    Tabs --> Dashboard & Transacoes & Cartoes & Investimentos & Perfil
    Login --> Onb
    Cadastro --> Verify[Verificar e-mail] --> Onboarding
    Onboarding --> Tabs
```

A navegação principal usa **bottom navigation** com 5 abas: **Dashboard · Transações · (+) · Investimentos · Perfil**. O botão central "+" abre o modal de novo lançamento.

---

## Fluxo de Autenticação

### Splash
- **Elementos:** logo centralizado, indicador de loading, versão no rodapé.
- **Lógica:** verifica token salvo (secure storage) → válido vai ao Dashboard; inválido/ausente vai a Boas-vindas. Timeout máximo 2s.

### Login
```mermaid
flowchart TD
    L[Tela Login] --> E[Email] --> S[Senha]
    S --> B{Validacao client}
    B -- Invalido --> Err[Erro inline]
    B -- Valido --> API[POST /auth/login]
    API -- 200 --> Bio{Biometria ativa?}
    Bio -- Sim --> Prompt[Autentica biometria] --> Dash[Dashboard]
    Bio -- Nao --> Dash
    API -- 401 --> Err2[Credenciais invalidas]
    API -- 429 --> Err3[Muitas tentativas - aguarde]
    L --> Criar[Criar conta] & Forgot[Esqueci minha senha] & Social[Google / Apple]
```
- **Campos:** E-mail (validação de formato), Senha (mín. 8, mostrar/ocultar).
- **Botões:** Entrar · Criar conta · Esqueci minha senha · login social.
- **Estados:** loading no botão, erro inline, rate-limit.

### Cadastro
- **Campos:** Nome, Sobrenome, E-mail, Telefone, Senha, Confirmar senha.
- **Validações:**
  - Nome/Sobrenome: obrigatórios, 2–50 caracteres.
  - E-mail: formato válido, único (verificado na API).
  - Telefone: máscara BR `(99) 99999-9999`, opcional mas validado se preenchido.
  - Senha: mín. 8, ao menos 1 maiúscula, 1 número e 1 símbolo; medidor de força.
  - Confirmar senha: deve coincidir.
  - Aceite de Termos + Política de Privacidade (LGPD) obrigatório.
```mermaid
flowchart TD
    C[Cadastro] --> V{Campos validos?}
    V -- Nao --> Ie[Erros inline por campo]
    V -- Sim --> Api[POST /auth/register]
    Api -- 201 --> Ver[Tela verificar e-mail]
    Api -- 409 --> Dup[E-mail ja cadastrado]
    Ver --> Code{Codigo correto?}
    Code -- Sim --> Onb[Onboarding]
    Code -- Nao --> Resend[Reenviar codigo]
```

### Recuperação de senha
```mermaid
flowchart TD
    F[Esqueci a senha] --> Em[Informa e-mail] --> Snd[POST /auth/forgot-password]
    Snd --> Msg[Se existe conta, enviamos instrucoes]
    Msg --> Link[Usuario abre deep link/codigo]
    Link --> New[Nova senha + confirmar]
    New --> Rst[POST /auth/reset-password]
    Rst -- 200 --> Done[Senha redefinida - voltar ao login]
    Rst -- token invalido/expirado --> ErrT[Link expirado - solicitar novo]
```
- **Segurança:** resposta genérica (não revela se e-mail existe), token de uso único com expiração de 30 min, invalida sessões ao redefinir.

---

## Fluxos das telas principais

### Novo lançamento (receita/despesa)
```mermaid
flowchart TD
    Plus[FAB +] --> Tipo{Receita ou Despesa?}
    Tipo --> Val[Valor] --> Cat[Categoria] --> Dt[Data] --> Obs[Observacao opcional]
    Cat --> CartO{Despesa em cartao?}
    CartO -- Sim --> SelCard[Seleciona cartao]
    Obs --> Save[Salvar]
    Save -- ok --> Toast[Sucesso + atualiza saldo] --> List[Lista]
    Save -- erro --> Inline[Erro / retry]
```

### Transações — busca/filtro/ordenação
- Lista paginada (infinite scroll), busca por texto, filtros (período, tipo, categoria, cartão), ordenação (data, valor). Swipe para editar/excluir. Estado vazio com CTA "Adicionar primeira transação".

### Metas
```mermaid
flowchart TD
    M[Metas] --> Nova[Criar meta] --> Form[Nome, valor-alvo, data-alvo]
    Form --> Calc[App calcula aporte mensal sugerido] --> Saved[Meta criada]
    Saved --> Aporte[Registrar aporte] --> Prog[Atualiza % e barra]
    Prog --> Risk{Aporte abaixo do necessario?}
    Risk -- Sim --> Alert[Alerta meta em risco]
    Prog --> Done{100%?}
    Done -- Sim --> Celebrate[Animacao de conquista]
```

### Investimentos (Premium)
```mermaid
flowchart TD
    I[Investimentos] --> Gate{Premium?}
    Gate -- Nao --> Pay[Paywall]
    Gate -- Sim --> Add[Adicionar ativo] --> Classe[Classe: RF / FII / Acao / ETF / Intl]
    Classe --> Dados[Ticker, qtd, preco medio] --> Persist[Salva]
    Persist --> Cot[Job atualiza preco atual] --> Rent[Rentabilidade e lucro]
    Rent --> Patr[Compoe patrimonio + evolucao]
```

### Relatórios
- Seleciona período (mensal/trimestral/anual) → gráficos receita×despesa, por categoria, evolução → "Exportar" (PDF/Excel, gate Premium) → compartilhar.

### Perfil & Configurações
- Dados (nome, e-mail, plano), tema (claro/escuro/sistema), biometria, notificações, gerenciar assinatura, segurança (MFA, trocar senha), privacidade (exportar/excluir dados — LGPD), sair.
