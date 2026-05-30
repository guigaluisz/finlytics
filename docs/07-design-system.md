# 07 — Design System

Sistema de design "Finlytics DS" — tokens, componentes e diretrizes. Implementado no Flutter via `ThemeData` + tokens em `core/theme`.

## Princípios
1. **Clareza acima de tudo** — números financeiros sempre legíveis.
2. **Confiança** — visual sóbrio, seguro, profissional.
3. **Feedback imediato** — toda ação tem resposta visual/tátil.
4. **Acessível** — contraste AA, alvos de toque ≥ 48dp, suporte a fonte grande.

## Cores (tokens)

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `primary` | `#1F6FEB` | `#4C8DFF` | ações, links, marca |
| `primaryContainer` | `#D7E6FF` | `#0B2D5E` | fundos de destaque |
| `secondary` | `#00B37E` | `#1DD1A1` | sucesso, receitas |
| `danger` | `#E5484D` | `#FF6369` | despesas, erros |
| `warning` | `#F5A623` | `#FFB938` | alertas |
| `background` | `#F7F8FA` | `#0E1116` | fundo de tela |
| `surface` | `#FFFFFF` | `#171B22` | cards |
| `onSurface` | `#1A1D23` | `#E6E8EB` | texto principal |
| `muted` | `#6B7280` | `#9BA1A8` | texto secundário |
| `border` | `#E5E7EB` | `#272B33` | divisórias |

**Semântica financeira:** receitas em `secondary` (verde), despesas em `danger` (vermelho), saldo neutro em `onSurface`.

## Tipografia
Fonte: **Inter** (fallback system). Escala (type scale):

| Estilo | Tamanho/Altura | Peso | Uso |
|--------|----------------|------|-----|
| Display | 32/40 | 700 | saldo principal |
| H1 | 24/32 | 700 | títulos de tela |
| H2 | 20/28 | 600 | seções |
| Body L | 16/24 | 400 | texto padrão |
| Body M | 14/20 | 400 | listas |
| Caption | 12/16 | 500 | rótulos, datas |
| Mono/Number | tabular | 600 | valores monetários |

## Espaçamento & raio
- Escala (4pt): `4, 8, 12, 16, 24, 32, 48`.
- Raio: `sm 8`, `md 12`, `lg 16`, `full 999`.
- Grid: padding lateral padrão `16`; gutter entre cards `12`.

## Elevação / sombra
- `card`: y2 blur8 rgba(0,0,0,.06) (light) / borda sutil (dark).
- `modal`: y8 blur24.

## Ícones
Conjunto outline 24px (ex.: `lucide`/`material symbols`). Categorias usam ícone + cor própria.

## Componentes (catálogo)
- **Button**: variantes `primary`, `secondary`, `ghost`, `danger`; estados default/pressed/disabled/loading; altura 48.
- **TextField**: label flutuante, hint, erro inline, ícone à direita (ex.: olho da senha), máscara (moeda, telefone).
- **Card**: container padrão com raio `lg` e sombra `card`.
- **ValueDisplay**: exibe moeda BRL com sinal e cor semântica.
- **CategoryChip**: ícone + cor + nome.
- **ProgressBar**: usado em metas e limite de cartão.
- **Charts**: donut (categorias), line (evolução), bars (relatórios). Lib: `fl_chart`.
- **BottomNav**: 5 itens com FAB central.
- **EmptyState**: ilustração + título + CTA.
- **Snackbar/Toast**: sucesso/erro/info.
- **Paywall sheet**: destaque de benefícios Premium + planos.
- **Skeleton loader**: placeholders durante carregamento.

## Formatação
- **Moeda:** `R$ 1.234,56` (pt-BR, `intl`).
- **Data:** `dd/MM/yyyy`; relativa quando recente ("hoje", "ontem").
- **Percentual:** `68%`, casas decimais só quando relevante.

## Acessibilidade
- Contraste mínimo AA (4.5:1 texto normal).
- Alvos de toque ≥ 48dp; `Semantics` em todos os controles.
- Suporte a `TextScaler` até 1.3 sem quebra.
- Não usar cor como único indicador (ícone/sinal + cor).

## Tema (exemplo de tokens em Dart)
```dart
abstract class AppColors {
  static const primary = Color(0xFF1F6FEB);
  static const secondary = Color(0xFF00B37E);
  static const danger = Color(0xFFE5484D);
  // ...ver mobile/lib/core/theme/app_colors.dart
}
```
