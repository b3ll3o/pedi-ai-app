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
├── app/                                # App Router
│   ├── login/                          # Pública
│   ├── dashboard/                      # Protegida (gate via proxy.ts + AuthenticatedLayout)
│   │   ├── layout.tsx                  # Usa <AuthenticatedLayout>
│   │   ├── page.tsx                    # /dashboard
│   │   ├── usuarios/{[id],novo}        # /dashboard/usuarios{,/[id],/novo}
│   │   ├── perfis/[id]/                # /dashboard/perfis{,/[id]}
│   │   └── permissoes/[id]/            # /dashboard/permissoes{,/[id]}
│   ├── restaurantes/                   # ⚠️ fora de /dashboard (exceção histórica)
│   │   ├── page.tsx                    # /restaurantes
│   │   ├── [id]/                       # /restaurantes/[id]
│   │   ├── novo/                       # /restaurantes/novo
│   │   └── layout.tsx                  # Usa <AuthenticatedLayout>
│   ├── api/auth/                       # Server routes que encapsulam o backend
│   │   ├── login/route.ts              # POST /api/auth/login (set cookies httpOnly)
│   │   ├── refresh/route.ts            # POST /api/auth/refresh (rotação)
│   │   └── logout/route.ts             # POST /api/auth/logout (limpa cookies)
│   ├── layout.tsx                      # Layout raiz (envolve AuthProvider via providers.tsx)
│   ├── providers.tsx                   # Client provider wrapper
│   └── globals.css                     # Design tokens (Tailwind v4 @theme)
├── components/
│   ├── ui/                             # Button, Input, Card, Badge, StatusBadge, Table, Modal, ConfirmDialog, CrudPageHeader, RowActions
│   │                                  # + UsuarioList, RestauranteForm, RestauranteList
│   ├── auth/                           # AuthenticatedLayout, ProtectedRoute, AdminOnly
│   ├── dashboard/                      # Sidebar, SidebarContext
│   ├── MainLayout.tsx                  # Layout com sidebar
│   ├── PublicLayout.tsx                # Layout público
│   └── seo/                            # SEO components
├── lib/
│   ├── api.ts                          # Cliente fetch com auto-refresh 401 (via /api/auth/refresh)
│   ├── auth-context.tsx                # AuthProvider + useAuth (access em localStorage, refresh em cookie httpOnly)
│   ├── page-meta.ts                    # PAGE_META + getPageMeta(pathname) + isAdminOnlyPath(pathname)
│   └── notifications.tsx               # Toast/Notification provider
└── proxy.ts                            # Gate server-side (Next.js 16): valida JWT inline (formato + exp) e redireciona
```

**Exceção de roteamento (histórica):** `restaurantes` está em `/restaurantes`, **não** em `/dashboard/restaurantes`. Hoje o `proxy.ts` **já protege** essa rota (matcher inclui `/restaurantes/:path*`), mas vale manter em mente ao reorganizar.

> Para novos domínios, migrar para `src/features/<dominio>/{domain,application,infrastructure,presentation}/` (ver CLAUDE.md do monorepo).

---

## Padrões Arquiteturais Críticos

### 1. Autenticação — Storage Triplo (access localStorage + cookies httpOnly)

`src/lib/auth-context.tsx` armazena tokens em **três camadas** (decisão deliberada, ver `auth/SKILL.md` RNF-01):

| Camada | O que | Por quê |
| --- | --- | --- |
| `localStorage` (`pedi_auth_access_token`, `pedi_auth_user`) | Access token + user | Usado pelo cliente para `Authorization: Bearer` |
| `document.cookie` `pedi_auth_access_token` (não httpOnly) | Espelho do access | Lido pelo **`src/proxy.ts`** server-side |
| `document.cookie` `pedi_auth_refresh_token` (**httpOnly**) | Refresh token | **Defesa contra XSS**: o browser recusa expor este cookie a JS |

Por isso **NÃO** persiste refresh em localStorage (foi removido). Server routes em `src/app/api/auth/{login,refresh,logout}/` são as únicas que setam/limpam o cookie httpOnly (o `document.cookie` no cliente não consegue escrever `HttpOnly`).

O `proxy.ts` (`/dashboard/:path*` e `/restaurantes/:path*`) **valida o JWT inline** (formato base64 + claim `exp`) antes de liberar render — defesa contra cookie forjado/garbage. Esta validação **NÃO substitui** a verificação de assinatura do backend (proxy não tem `JWT_SECRET`); apenas filtra tokens obviamente inválidos antes do trabalho caro de render.

`AuthenticatedLayout` (`src/components/auth/AuthenticatedLayout.tsx`) é a **segunda camada cliente**: verifica `isAuthenticated` e (se a página é admin-only) `user.perfil?.nome === 'ADMIN'`, redireciona via `router.push`. É a única forma de redirecionar para `/login` em transições client-side sem cookie (proxy já cobriu o caso server-side).

`AdminOnly` (`src/components/auth/AdminOnly.tsx`) é **puramente visual** — não redireciona, só renderiza `null` se não for ADMIN. Usado na `Sidebar` para ocultar menus.

### 2. Cliente API — Auto-Refresh em 401 (via server route)

`src/lib/api.ts` expõe `api.{auth,usuarios,permissoes,perfis,restaurantes}`. Cada recurso tem `listarTodos`, `contar`, `listarUm`, `criar`, `atualizar`, `deletar`. Internamente:
- `fetchJson()` adiciona `Authorization: Bearer <accessToken>` automaticamente
- Em 401, chama `POST /api/auth/refresh` (server route lê o refresh do cookie httpOnly) e **refaz a request original** com o novo token
- Múltiplas chamadas 401 simultâneas são deduplicadas via `refreshInProgress` / `refreshPromise`
- Em falha de refresh, limpa localStorage e propaga o erro

**Endpoints de contagem** (`api.<recurso>.contar()`) consomem `GET /<recurso>/count` da API — não baixam a lista só para mostrar contador (usado nos cards de KPI do `CrudPageHeader`).

Nunca chamar `fetch` direto para a API — usar `api.*`. O auto-refresh é parte do contrato. Para auth (login/logout/refresh), existem as server routes `/api/auth/*` que encapsulam o backend e gerenciam cookies.

### 3. Roteamento Protegido

| Camada | Onde | O que faz |
|--------|------|-----------|
| Proxy (ex-middleware) | `src/proxy.ts` | Server-side: valida JWT inline (formato + `exp`); redireciona `/dashboard/*` e `/restaurantes/*` sem cookie válido → `/login` |
| `AuthenticatedLayout` | `src/components/auth/` | Client-side: redirect via `router.push` se `!isAuthenticated`; ou se a rota é admin-only e o user não é ADMIN |
| `AdminOnly` | `src/components/auth/` | Visual: renderiza `null` se não-ADMIN (esconde menu) |

Defense in depth: proxy bloqueia antes do HTML (e filtra JWTs garbage), AuthenticatedLayout cobre transições client-side, AdminOnly esconde UI.

### 4. Server Routes de Auth (`/api/auth/*`)

**Por que existem:** o browser recusa `document.cookie = '...; HttpOnly'`. Para setar cookies httpOnly é preciso uma rota server-side. As 3 routes encapsulam o backend NestJS e adicionam a camada de cookies:

- **`POST /api/auth/login`** — chama `${API_URL}/auth/login`, recebe `{accessToken, refreshToken, expiresIn}`, e seta **2 cookies**: `pedi_auth_refresh_token` (httpOnly) + `pedi_auth_access_token` (não httpOnly para o proxy ler).
- **`POST /api/auth/refresh`** — lê `pedi_auth_refresh_token` do cookie httpOnly, chama `${API_URL}/auth/refresh`, devolve o novo par; o cookie httpOnly é **rotacionado** (rotação de refresh tokens).
- **`POST /api/auth/logout`** — chama `${API_URL}/auth/logout` com o access token (body) para invalidar o refresh no backend, e limpa ambos os cookies (`max-age=0`).

### 5. Next.js Rewrites

`next.config.ts` define rewrite `/api/:path*` → `http://localhost:3001/:path*`. Cuidado: as server routes em `src/app/api/auth/*` **também** respondem em `/api/auth/*` e têm prioridade sobre o rewrite (Next.js resolve routes antes de rewrites). O cliente (`lib/api.ts`) usa `NEXT_PUBLIC_API_URL` direto para `${API_URL}/users` etc., não passa por `/api/`.

### 6. UI Components

**Sempre usar** `src/components/ui/` (Button, Input, Card, Badge, StatusBadge, Table, Modal, ConfirmDialog, CrudPageHeader, RowActions). Nunca inputs/buttons HTML diretos — ver `STYLE_GUIDE.md` para detalhes de estilização (variáveis CSS, spacing, estados).

**Acessibilidade obrigatória:**

- `<Input>` emite `aria-invalid` + `aria-describedby` + `role="alert"` no erro (anunciável por NVDA/JAWS).
- `<Modal>` implementa focus trap (Tab/Shift+Tab) e `role="dialog"` + `aria-modal="true"` + `aria-labelledby`.
- `<CrudPageHeader>` é o header padronizado para todas as páginas de gestão; aceita `stats` (cards de KPI alimentados por `api.<recurso>.contar()`).

### 7. Cores e Design Tokens

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
- `auth/` — autenticação (AuthContext, storage triplo, server routes, auto-refresh)
- `dashboard/` — rotas autenticadas, AuthenticatedLayout, Sidebar
- `infra/` — build, deploy, configuração VPS
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
- **Token refresh**: nunca duplicar a lógica de refresh — usar `api.*` que já trata 401 via `/api/auth/refresh`.
- **Storage triplo**: access em localStorage + cookie (proxy), refresh em cookie httpOnly. Não persistir refresh em localStorage.
- **Proxy vs AuthenticatedLayout**: o proxy usa cookie + valida JWT; o `AuthenticatedLayout` cobre transições client-side e checa adminOnly. Em SSR/hidratação, sempre contar com o proxy como primeira barreira.
- **Cobertura**: testes novos precisam manter 80% — se quebrar, `npm run test:coverage` falha o build.
- **Path aliases**: `@/*` resolve para `src/*` (configurado em `jest.config.js` e `tsconfig.json`).
- **`/api/auth/*` server routes vs rewrite**: as server routes em `src/app/api/auth/*` respondem ANTES do rewrite `/api/:path*` → backend. Logo, login/refresh/logout do app **não** vão para o backend direto; passam pelas routes que setam cookies.
- **Endpoints `/count`**: usar `api.<recurso>.contar()` em vez de `listarTodos().length` para mostrar contadores (perfis, permissoes, usuarios, restaurantes).
- **Acessibilidade**: `<Input>` e `<Modal>` já emitem ARIA correto; não duplicar. `<button>` HTML direto perde `focus-visible` + `aria-busy` em loading.
