# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in `pedi-ai-app`.

## ⚠️ Next.js 16 — Read Before Coding

This is **Next.js 16**, which has **breaking changes** from the version in training data. APIs, conventions, and file structure may differ. Before writing any Next.js code, use WebFetch em `https://nextjs.org/docs` (oficial) ou `WebSearch` para confirmar a API atual — `node_modules/next/dist/docs/` contém apenas docs internas (community, contribution, pages router), não o guia de uso. Heed deprecation notices. (Also in `AGENTS.md`.)

---

## Comandos

```bash
npm run dev              # Dev server (localhost:3000)
npm run build            # Build produção (output: .next/standalone)
npm run lint             # ESLint
npm run lint:fix         # ESLint + auto-fix
npm run format           # Prettier
npm test                 # Jest (todos)
npm test -- <path>       # Jest (um arquivo): npm test -- src/components/ui/Button.test.tsx
npm test -- -t "<name>"  # Jest (um teste pelo nome)
npm run test:coverage    # Cobertura (mínimo 80% — ver jest.config.js)
```

API esperada em `http://localhost:3001` (`NEXT_PUBLIC_API_URL`). Subir com `cd ../pedi-ai-api && npm run start:dev` ou `docker-compose up -d`.

---

## Estrutura Atual

```
src/
├── app/                          # App Router
│   ├── login/                    # Pública
│   ├── dashboard/                # Protegida (gate via proxy.ts)
│   │   ├── page.tsx              # /dashboard
│   │   ├── usuarios/{[id],novo}  # /dashboard/usuarios{,/[id],/novo}
│   │   ├── perfis/[id]/          # /dashboard/perfis{,/[id]}
│   │   └── permissoes/[id]/      # /dashboard/permissoes{,/[id]}
│   ├── restaurantes/             # ⚠️ fora de /dashboard (exceção histórica)
│   │   ├── page.tsx              # /restaurantes
│   │   ├── [id]/                 # /restaurantes/[id]
│   │   ├── novo/                 # /restaurantes/novo
│   │   └── layout.tsx + RestaurantesLayoutClient.tsx
│   ├── layout.tsx                # Layout raiz (envolve AuthProvider via providers.tsx)
│   ├── providers.tsx             # Client provider wrapper
│   └── globals.css               # Design tokens (Tailwind v4 @theme)
├── components/
│   ├── ui/                       # Button, Input, Card, Badge, StatusBadge, Table (reutilizáveis)
│   │                            # + UsuarioList, RestauranteForm, RestauranteList
│   ├── auth/                     # ProtectedRoute, AdminOnly
│   ├── dashboard/                # DashboardLayout, Sidebar, SidebarContext
│   ├── MainLayout.tsx            # Layout com sidebar
│   ├── PublicLayout.tsx          # Layout público
│   └── seo/                      # SEO components
├── lib/
│   ├── api.ts                    # Cliente fetch com auto-refresh 401
│   └── auth-context.tsx          # AuthProvider + useAuth (dual storage: localStorage + cookie)
└── proxy.ts                      # Gate server-side (Next.js 16 substituiu middleware.ts por proxy.ts): redireciona /dashboard/* e /restaurantes/* sem cookie
openspec/                         # specs/, changes/, archive/ — ver CLAUDE.md do monorepo
```

**Exceção de roteamento (histórica):** `restaurantes` está em `/restaurantes`, **não** em `/dashboard/restaurantes`. Hoje o `proxy.ts` **já protege** essa rota (matcher inclui `/restaurantes/:path*`), mas vale manter em mente ao reorganizar.

> Para novos domínios, migrar para `src/features/<dominio>/{domain,application,infrastructure,presentation}/` (ver CLAUDE.md do monorepo).

---

## Padrões Arquiteturais Críticos

### 1. Autenticação — Dual Storage (localStorage + cookie)

`src/lib/auth-context.tsx` armazena tokens em **dois lugares**:
- `localStorage` (`pedi_auth_access_token`, `pedi_auth_refresh_token`, `pedi_auth_user`) — usado pelo cliente
- `document.cookie` (`pedi_auth_access_token`) — lido pelo **`src/proxy.ts`** server-side

Por isso o cookie é escrito com `httpOnly: false`. O proxy (`/dashboard/:path*` e `/restaurantes/:path*`) redireciona para `/login` quando o cookie está ausente — isso acontece **antes** do React montar.

`ProtectedRoute` (`src/components/auth/ProtectedRoute.tsx`) é a **segunda camada**: client-side, verifica `isAuthenticated` do contexto e redireciona via `router.push`. `requiredRole="ADMIN"` valida `user.perfil?.nome === requiredRole`.

`AdminOnly` (`src/components/auth/AdminOnly.tsx`) é **puramente visual** — não redireciona, só renderiza `null` se não for ADMIN. Usado na `Sidebar` para ocultar menus.

### 2. Cliente API — Auto-Refresh em 401

`src/lib/api.ts` expõe `api.{auth,usuarios,permissoes,perfis,restaurantes}`. Internamente:
- `fetchJson()` adiciona `Authorization: Bearer <accessToken>` automaticamente
- Em 401, chama `refreshAccessToken()` e **refaz a request original** com o novo token
- Múltiplas chamadas 401 simultâneas são deduplicadas via `refreshInProgress` / `refreshPromise`
- Em falha de refresh, limpa localStorage e propaga o erro

Nunca chamar `fetch` direto para a API — usar `api.*`. O auto-refresh é parte do contrato.

### 3. Roteamento Protegido

| Camada | Onde | O que faz |
|--------|------|-----------|
| Proxy (ex-middleware) | `src/proxy.ts` | Server-side: redireciona `/dashboard/*` e `/restaurantes/*` sem cookie |
| `ProtectedRoute` | `src/components/auth/` | Client-side: redirect via `router.push` se `!isAuthenticated` |
| `AdminOnly` | `src/components/auth/` | Visual: renderiza `null` se não-ADMIN |

Defense in depth: proxy bloqueia antes do HTML, ProtectedRoute cobre transições client-side, AdminOnly esconde UI.

### 4. Next.js Rewrites

`next.config.ts` define rewrite `/api/:path*` → `http://localhost:3001/:path*`. Cuidado: a API client (`lib/api.ts`) usa `NEXT_PUBLIC_API_URL` direto, não passa por `/api/`.

### 5. UI Components

**Sempre usar** `src/components/ui/` (Button, Input, Card, Badge, StatusBadge, Table). Nunca inputs/buttons HTML diretos — ver `STYLE_GUIDE.md` para detalhes de estilização (variáveis CSS, spacing, estados).

### 6. Cores e Design Tokens

Definidos em `src/app/globals.css` via Tailwind v4 `@theme`:
- `--color-primary: #0D9488` (teal) / `--color-secondary: #1E3A5F` (navy)
- Tokens derivados: `-dark`, `-light`; semânticos: `success`, `warning`, `error`, `background`, `surface`, `text-primary`, `text-secondary`, `border`
- Usar como classes Tailwind: `bg-primary`, `text-text-secondary`, `border-border`. **Evitar** `gray-100`, `gray-700` hardcoded.

---

## Agent-Skills + DDD

Metodologia, skills base, personas, slash commands e regras de traceability estão no **`/home/leo/pedi-ai/CLAUDE.md`** (monorepo). Resumo local:

- Skills de domínio: `.claude/skills/<dominio>/SKILL.md`
- Skills base: `.claude/skills/<skill-base>/SKILL.md`
- Personas: `.claude/agents/<persona>.md`
- Slash commands: `.claude/commands/<cmd>.md`
- Idioma: **pt-BR** em código e docs
- Coverage: **80%** enforced em `jest.config.js` (`coverageThreshold.global`)

**Skills de domínio neste app** (`.claude/skills/`):
- `app/` — estrutura raiz e providers
- `auth/` — autenticação (AuthContext, dual storage, ProtectedRoute, auto-refresh)
- `dashboard/` — rotas autenticadas
- `infra/` — build, deploy, configuração
- `seo/` — sitemap, robots, metadata

**Skills base específicas do app**: `frontend-ui-engineering` (carregue ao mexer em componentes UI, design tokens, ou Server/Client Components).

---

## Testes

- Framework: Jest 30 + Testing Library + jsdom (`jest.config.js`)
- Localização: `__tests__/` ao lado do código testado (ex: `src/components/ui/__tests__/Button.test.tsx`)
- Coverage mínimo 80% — branches, functions, lines, statements (todas enforced)
- Pastas ignoradas em coverage: `/app/`, `/lib/`, `MainLayout`, `Sidebar`, `components/ui/index`, etc. — ver `jest.config.js`
- E2E (Playwright) está em `../pedi-ai-e2e/` — **não** roda dentro deste projeto

Padrão de teste de componente: render + query por `screen.getByRole` / `getByText`, simular usuário com `@testing-library/user-event`. Ver `src/components/ui/__tests__/Button.test.tsx` para referência.

---

## Deploy

Build produz `.next/standalone/server.js` (output `standalone` em `next.config.ts`). Service file em `deploy/pedi-ai-app.service` — `WorkingDirectory=/root/pedi-ai-app`, `ExecStart=/usr/bin/node .next/standalone/server.js`. VPS em `187.77.204.108` com SSL via Let's Encrypt.

---

## Gotchas

- **Next.js 16**: confirmar API atual via WebFetch em `https://nextjs.org/docs` ou WebSearch antes de criar rotas, layouts ou server actions. Padrões do Next 14/15 não se aplicam integralmente. `node_modules/next/dist/docs/` tem só docs internas (não é guia de uso).
- **Token refresh**: nunca duplicar a lógica de refresh — usar `api.*` que já trata 401.
- **Proxy vs ProtectedRoute**: o proxy usa cookie; o `AuthProvider` precisa ter rodado para o ProtectedRoute checar contexto. Em SSR/hidratação, sempre contar com o proxy como primeira barreira.
- **Cobertura**: testes novos precisam manter 80% — se quebrar, `npm run test:coverage` falha o build.
- **Path aliases**: `@/*` resolve para `src/*` (configurado em `jest.config.js` e `tsconfig.json`).
