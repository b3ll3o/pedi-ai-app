---
name: app
description: Domínio raiz do pedi-ai-app — estrutura geral, providers, layout raiz, landing page, design tokens, e componentes UI compartilhados. Carregue ao criar nova rota pública, novo componente em `src/components/ui/`, ou alterar providers globais.
type: domain
status: implemented
domain: app
---

# Aplicação pedi-ai-app (app)

## Visão Geral

Interface web do sistema PediAI. Aplicação Next.js 16 (App Router) com React 19 e Tailwind CSS v4. Cobre landing page, providers globais, design tokens, e biblioteca de componentes UI reutilizáveis.

## Quando Usar

- Criar ou alterar a landing page (rota `/`)
- Adicionar novo componente a `src/components/ui/`
- Alterar design tokens (CSS variables em `globals.css`)
- Modificar `layout.tsx` raiz ou `providers.tsx`
- Adicionar nova rota pública
- Adicionar dependência de UI (ícones, animações)

## Stack

- **Next.js 16** (App Router) — atenção: API mudou em relação a 14/15
- **React 19**
- **Tailwind CSS v4** (tokens via `@theme`)
- **Lucide React** (ícones)

## Modelo de Domínio (Frontend)

### Páginas

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/` | Pública (Server Component) | Landing page |
| `/login` | Pública | Formulário de login |
| `/dashboard/*` | Protegida | Rotas autenticadas |
| `/restaurantes/*` | Protegida | Gestão de restaurantes (exceção histórica fora de `/dashboard`) |

### Estrutura de Diretórios

```
src/
├── app/                          # App Router
│   ├── layout.tsx                # Layout raiz
│   ├── providers.tsx             # Client provider wrapper
│   ├── globals.css               # Design tokens (Tailwind v4 @theme)
│   ├── login/                    # Pública
│   ├── dashboard/                # Protegida
│   └── restaurantes/             # Protegida (exceção histórica)
├── components/
│   ├── ui/                       # Button, Input, Card, Badge, StatusBadge, Table
│   ├── auth/                     # ProtectedRoute, AdminOnly
│   ├── dashboard/                # DashboardLayout, Sidebar
│   └── MainLayout.tsx / PublicLayout.tsx
└── lib/
    ├── api.ts                    # Cliente fetch com auto-refresh 401
    └── auth-context.tsx          # AuthProvider + useAuth
```

## Requisitos Funcionais (RF)

- RF-01: Landing page renderiza marketing (hero, features, pricing, FAQ, CTA)
- RF-02: Providers globais (AuthProvider) montados no `layout.tsx` raiz
- RF-03: Componentes UI em `src/components/ui/` são reutilizáveis e estilizados
- RF-04: Design tokens via CSS variables em `globals.css` (Tailwind v4)
- RF-05: Rotas públicas (`/`, `/login`) acessíveis sem auth
- RF-06: Rotas protegidas redirecionam para `/login` se sem sessão

## Requisitos Não-Funcionais (RNF)

- RNF-01: **Lighthouse Score ≥ 90** (Performance, A11y, Best Practices, SEO)
- RNF-02: Componentes UI acessíveis por teclado e screen reader
- RNF-03: Design tokens — nunca usar `gray-100`/`gray-700` hardcoded; usar `bg-primary`, `text-text-secondary`
- RNF-04: Server Component por default; `'use client'` só quando necessário
- RNF-05: **Next.js 16** — confirmar API atual via WebFetch em `https://nextjs.org/docs` antes de usar features novas

## Componentes UI Compartilhados

| Componente | Props principais | Uso |
|------------|------------------|-----|
| `Button` | `variant: primary \| secondary \| ghost \| danger`, `size: sm \| md \| lg`, `loading`, `disabled` | Ações |
| `Input` | `name`, `label?`, `type: text \| email \| password \| number`, `error?`, `placeholder` | Campos de form |
| `Card` | `children`, `className?` | Containers |
| `Badge` | `children`, `className?` | Tags |
| `StatusBadge` | `status: string` | Status colorido |
| `Table` | `columns: [{ key, label }]`, `data`, `onRowClick?` | Listas tabulares |

## Design Tokens

```css
/* Em src/app/globals.css (Tailwind v4 @theme) */
--color-primary: #0D9488;       /* teal */
--color-secondary: #1E3A5F;     /* navy */
--color-success: #059669;
--color-warning: #D97706;
--color-error: #DC2626;
--color-background, --color-surface, --color-text-primary, --color-text-secondary, --color-border
```

**Usar como classes Tailwind:** `bg-primary`, `text-text-secondary`, `border-border`. **Evitar** `gray-100`, `gray-700` hardcoded.

## Critérios de Aceitação

- [x] Providers globais montados
- [x] Componentes UI reutilizáveis implementados
- [x] Design tokens aplicados consistentemente
- [x] Landing page renderiza com SEO + a11y
- [x] Build de produção gera `.next/standalone/server.js`

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Server Component não precisa pensar em estado" | Server Components podem importar Client Components;混 misturar é necessário, não opcional. |
| "`'use client'` no topo do componente é inofensivo" | Aumenta bundle JS do cliente. Default é Server Component; use Client só com interatividade real. |
| "Cores hardcoded economizam tempo" | Quebra theming dark/light e dificulta redesign. Use sempre tokens. |
| "Tailwind v3 e v4 são iguais" | v4 mudou configuração (CSS-first via `@theme`, sem `tailwind.config.js`). Erro comum. |
| "Next.js 15 → 16 não tem breaking change" | Tem. `middleware.ts` virou `proxy.ts` em alguns casos. Confirmar via docs. |
| "Reaproveitar HTML puro em vez de Button | `Button` tem a11y (focus ring, aria-busy em loading) embutido. Não reinventar. |

## Red Flags

- `'use client'` em componente que não usa hooks ou eventos
- Componente HTML puro (`<button>`, `<input>`) em vez de `Button`/`Input` da UI
- `gray-100`/`gray-700`/`bg-red-500` hardcoded em vez de tokens
- `console.log` em produção
- Componente sem `key` em lista dinâmica
- Imagem sem `alt` ou sem `next/image`
- Server Component fazendo `fetch` em `useEffect`
- `useState` para dados que podem vir do server

## Verificação

- [ ] `npm run lint` sem erros
- [ ] `npm run test:coverage` ≥ 80%
- [ ] `npm run build` completa sem erros
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Landing page renderiza com meta tags e Open Graph
- [ ] Navegação por teclado funcional (Tab, Enter, Esc)
- [ ] Sem `console.log` em build de produção
- [ ] `next/image` em todas as imagens
