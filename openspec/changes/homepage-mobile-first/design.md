# Design: Homepage Mobile-First

## Decisões arquiteturais

### 1. Componente dedicado `MobileNav` (client)

**Decisão:** extrair a navegação pública para um componente client
localizado em `src/components/landing/MobileNav.tsx`.

**Razão:** a homepage hoje é `'use client'` inteira, mas a tendência
natural é migrar para Server Components. Manter a lógica de UI
interativa (drawer) num componente client isolado deixa o resto da
homepage livre para ser refatorado para RSC no futuro.

**Alternativas consideradas:**

- **Drawer com Radix/shadcn**: rejeitada — adiciona dependência grande
  para uma única feature. O drawer caseiro é < 200 linhas e atende os
  requisitos (ESC, backdrop, body scroll lock, focus).
- **Bottom tab bar**: rejeitada — o público é um site de marketing
  (visitantes que ainda não são clientes), não um app autenticado. O
  padrão do mercado para landing pages é hamburger.
- **Manter os links sempre visíveis sem alternativa no mobile**:
  rejeitada — é exatamente o problema que estamos resolvendo.

### 2. CSS Modules + Tailwind coexistem

A homepage usa **CSS Modules** (`page.module.css`), enquanto
componentes mais novos (`Modal`, `Sidebar`) usam **Tailwind utility
classes**. Vamos seguir o padrão da homepage (`MobileNav.module.css`)
porque:

- A homepage é a única página com `page.module.css` e migrar para
  Tailwind está fora do escopo.
- CSS Modules dão escopo automático e não exigem o purge de classes.
- O `MobileNav` fica autocontido (componente + CSS module).

### 3. Mobile-first CSS

A regra é: **estilos base cobrem mobile**, `@media (min-width: …)`
adiciona progressive enhancement.

```css
/* Mobile (default) */
.hamburger { display: inline-flex; }
.navInline { display: none; }
.drawer { position: fixed; ... }

/* Desktop (>= 768px) */
@media (min-width: 48em) {
  .hamburger { display: none; }
  .navInline { display: flex; }
  .drawer { display: none !important; }
}
```

### 4. Acessibilidade

- Hamburger: `aria-controls`, `aria-expanded`, `aria-label` em pt-BR
- Drawer: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Foco volta para o hamburger ao fechar
- ESC fecha
- Backdrop tem `aria-hidden="true"`
- Navegação do drawer tem `<nav aria-label="Navegação mobile">`
- Touch targets 44×44 px no hamburger e nos links do drawer

### 5. iOS / safe areas

- `min-height: 100dvh` (além de 100vh como fallback) em `.page` e `.hero`
- `padding-top: env(safe-area-inset-top)` no `.nav` (top fixed bar)

### 6. Estratégia de testes

- **Unit (Jest)**: comportamento do `MobileNav` — abrir/fechar, ARIA,
  body scroll lock, scrollIntoView de âncoras. Mock de CSS module via
  `__mocks__/styleMock.js`.
- **E2E (Playwright)**: viewport por projeto (`mobile-375`,
  `mobile-390`, `tablet-768`, `laptop-1280`, `desktop-1536`). Asserts
  visuais: hamburger visible/hidden por breakpoint, touch targets
  medidos via `boundingBox()`, sem `scrollWidth > clientWidth`.

## Layout mobile (< 768px)

```
┌──────────────────────────────────────────┐
│  [Logo Pedi-AI]   [☰]    [Começar Grátis]│  ← nav fixed
├──────────────────────────────────────────┤
│                                          │
│              Hero content                │
│                                          │
├──────────────────────────────────────────┤
│  Social proof                            │
├──────────────────────────────────────────┤
│  Section: Como Funciona                  │
│  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │ Step │  │ Step │  │ Step │           │
│  │  1   │  │  2   │  │  3   │           │
│  └──────┘  └──────┘  └──────┘           │
│  (cards empilhados verticalmente)        │
├──────────────────────────────────────────┤
│  ... resto da página                     │
└──────────────────────────────────────────┘

Drawer (quando aberto):
┌──────────────┬───────────────────────────┐
│              │                           │
│  [Funcionali-│                           │
│   dades]     │   (backdrop escuro)       │
│  [Como       │                           │
│   Funciona]  │                           │
│  [Preços]    │                           │
│  ─────────   │                           │
│  [Entrar]    │                           │
│  [Começar    │                           │
│   Grátis]    │                           │
│              │                           │
└──────────────┴───────────────────────────┘
```

## Layout desktop (≥ 768px)

```
┌──────────────────────────────────────────────────┐
│ [Logo]  Funcionalidades  Como Funciona  Preços   │
│                       Entrar  [Começar Grátis]   │
├──────────────────────────────────────────────────┤
│                   Hero content                   │
└──────────────────────────────────────────────────┘
```

## Critérios de qualidade (quality gate)

- [ ] `npm test` passa em 100% (146+ testes)
- [ ] `npm run lint` sem erros
- [ ] `npm run build` completa sem warnings novos
- [ ] `npm run test:coverage` mantém 80%+
- [ ] `pedi-ai-e2e` roda `homepage.spec.ts` em todos os viewports sem
      falhas
- [ ] Lighthouse mobile ≥ 90 em performance, accessibility, best
      practices, SEO
