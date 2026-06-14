---
name: auth
description: Domínio de autenticação do frontend (pedi-ai-app) — AuthContext, storage triplo (access localStorage + cookie não-httpOnly lido pelo proxy + refresh em cookie httpOnly), server routes /api/auth/*, ProtectedRoute, AuthenticatedLayout, auto-refresh de token via server route. Carregue ao mexer em auth, login, refresh, logout, ou fluxo de sessão.
type: domain
status: implemented
domain: auth
---

# Autenticação Frontend (auth)

## Visão Geral

Domínio de autenticação do app: `AuthContext` (Provider + hook), storage triplo de tokens (decisão deliberada, ver RNF-01), cliente API com auto-refresh em 401 (via server route), `AuthenticatedLayout` + `ProtectedRoute` + `AdminOnly` para autorização client-side, e proxy server-side (`src/proxy.ts`) com validação inline de JWT como gate.

## Quando Usar

- Mexer em login, logout, refresh
- Adicionar nova rota protegida
- Alterar storage de tokens
- Investigar bug de 401/403 em requisições
- Adicionar novo claim ao contexto (ex: `perfil`)
- Mexer nas server routes de `/api/auth/*`

## Modelo de Domínio

### AuthContext API

```typescript
interface AuthContextType {
  user: Usuario | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}
```

### Hook

```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

### Fluxo de Login

```
1. Usuário acessa /login
2. Preenche email + senha
3. login(email, senha)
4. AuthContext → POST /api/auth/login (server route, não backend direto)
5. Server route → POST ${API_URL}/auth/login
6. Recebe { accessToken, refreshToken, expiresIn }
7. Server route seta 2 cookies via Set-Cookie:
   - pedi_auth_refresh_token (httpOnly, secure em prod, samesite=lax, max-age 7d)
   - pedi_auth_access_token (NÃO httpOnly, samesite=lax, max-age = expiresIn)
8. Server route devolve o { accessToken, refreshToken, expiresIn } no body
9. Cliente guarda accessToken em localStorage (e o user em pedi_auth_user)
10. setUser(dados do usuário + accessToken)
11. Redirect para /dashboard
```

### Fluxo de Logout

```
1. Click em logout na Sidebar
2. AuthContext.logout()
3. POST /api/auth/logout com { accessToken } no body
4. Server route → POST ${API_URL}/auth/logout (invalida refresh no backend + persiste jti do access em revoked_jtis)
5. Server route limpa ambos os cookies (Set-Cookie com max-age=0)
6. Cliente limpa localStorage
7. setUser(null)
8. Redirect para /login
```

### Fluxo de Auto-Refresh (401)

```
Cliente API (lib/api.ts):
- fetchJson() adiciona Authorization: Bearer <accessToken>
- Em 401, chama POST /api/auth/refresh (NÃO o backend direto)
- Server route lê pedi_auth_refresh_token do cookie httpOnly
- Server route → POST ${API_URL}/auth/refresh
- Recebe novo par; server route rotaciona cookie httpOnly (Set-Cookie com novo refresh)
- Cliente atualiza localStorage com novo accessToken
- Deduplicação: múltiplas 401 simultâneas compartilham 1 refresh (refreshPromise)
- Em falha de refresh, server route limpa cookie httpOnly e devolve 401
- Cliente limpa localStorage e propaga erro
```

### Fluxo do Proxy (gate server-side)

```
src/proxy.ts roda em todas as requests com matcher /dashboard/:path* e /restaurantes/:path*:
1. Lê cookie pedi_auth_access_token (não httpOnly)
2. Se ausente → redirect para /login
3. Se presente mas JWT inválido (formato != 3 segmentos base64) → redirect
4. Se presente mas exp < now() → redirect
5. Caso contrário → libera render (backend valida assinatura depois)
```

## Storage Triplo (decisão deliberada)

| Camada | O que | Por quê |
| --- | --- | --- |
| `localStorage` (`pedi_auth_access_token`, `pedi_auth_user`) | Access token + user | Usado pelo cliente para `Authorization: Bearer` |
| `document.cookie` `pedi_auth_access_token` (não httpOnly) | Espelho do access | Lido pelo **`src/proxy.ts`** server-side para gate |
| `document.cookie` `pedi_auth_refresh_token` (**httpOnly**) | Refresh token | Defesa contra XSS: o browser recusa expor este cookie a JS |

**Por que access não é httpOnly:** o `proxy.ts` é server-side mas precisa do token para fazer a validação estrutural (formato + `exp`); poderia chamar o backend para validar, mas isso adiciona latência em todo render de página protegida.

**Por que refresh é httpOnly:** TTL de 7 dias. Se XSS capturar, atacante fica com sessão válida por semana. Cookie httpOnly elimina esse vetor.

**Migração de segurança:** versões anteriores guardavam refresh em localStorage. O `clearAuthStorage()` em `auth-context.tsx` remove a chave legacy `pedi_auth_refresh_token` para garantir que nenhum refresh antigo persistido possa ser reutilizado.

## Server Routes de Auth (`src/app/api/auth/*`)

| Route | Método | O que faz |
| --- | --- | --- |
| `login/route.ts` | POST | Chama backend `/auth/login`, seta 2 cookies, devolve par no body |
| `refresh/route.ts` | POST | Lê refresh do cookie httpOnly, chama backend `/auth/refresh`, rotaciona cookie, devolve novo par |
| `logout/route.ts` | POST | Recebe accessToken no body, chama backend `/auth/logout` para invalidar, limpa ambos os cookies |

**Por que existem:** o browser recusa `document.cookie = '...; HttpOnly'`. Para setar cookies httpOnly, é preciso uma rota server-side. As 3 routes encapsulam o backend NestJS e adicionam a camada de cookies.

## Componentes de Proteção

| Componente | Onde | Comportamento |
| --- | --- | --- |
| `proxy.ts` (server) | `src/proxy.ts` | Valida JWT inline (formato + `exp`); redireciona `/dashboard/*` e `/restaurantes/*` sem cookie válido → `/login` |
| `AuthenticatedLayout` (client) | `src/components/auth/` | Redireciona via `router.push` se `!isAuthenticated` ou se rota é admin-only e user não é ADMIN |
| `ProtectedRoute` (client, legacy) | `src/components/auth/` | Redireciona via `router.push` se `!isAuthenticated`; `requiredRole="ADMIN"` valida `user.perfil?.nome` |
| `AdminOnly` (visual) | `src/components/auth/` | Renderiza `null` se não for ADMIN (esconde menu) |

**Defense in depth:** proxy bloqueia antes do HTML (e filtra JWTs garbage), AuthenticatedLayout cobre transições client-side, AdminOnly esconde UI.

**Quando usar qual:**
- **Rota nova em `/dashboard/*` ou `/restaurantes/*`:** wrappar com `<AuthenticatedLayout>` no `layout.tsx`. Proxy já cobre o caso server-side; este é o complemento client-side.
- **Página inteira com `requiredRole="ADMIN"`** dentro de `/dashboard`: pode usar `<ProtectedRoute requiredRole="ADMIN">` no topo da página.
- **Esconder um item de menu** sem redirecionar: usar `<AdminOnly>`.

## Requisitos Funcionais (RF)

- RF-01: Login persiste tokens, seta cookies httpOnly, redireciona para `/dashboard`
- RF-02: Logout limpa storage, limpa cookies httpOnly via server route, redireciona para `/login`
- RF-03: Refresh automático em 401 com deduplicação, via server route que rotaciona cookie
- RF-04: Rotas protegidas redirecionam para `/login` se sem sessão (proxy + AuthenticatedLayout)
- RF-05: Sidebar mostra nome do usuário + botão logout
- RF-06: `useAuth().isAuthenticated` é fonte de verdade client-side
- RF-07: Rotas admin-only redirecionam para `/dashboard` se user não é ADMIN
- RF-08: Proxy filtra JWTs garbage (formato) e expirados (`exp`) antes de liberar render

## Requisitos Não-Funcionais (RNF)

- RNF-01: **Storage triplo intencional** — `localStorage` para access (cliente), `cookie` não-httpOnly para access (proxy), `cookie` httpOnly para refresh (defesa XSS). Decisão documentada por ser a única forma de ter proxy server-side **e** defesa XSS simultaneamente.
- RNF-02: Access token nunca exposto em logs
- RNF-03: `refreshInProgress` / `refreshPromise` deduplica chamadas paralelas
- RNF-04: Falha de refresh = logout automático (limpa storage + cookie via server route + redirect)
- RNF-05: Cookie `pedi_auth_access_token` com `secure: true` em prod, `sameSite: 'Lax'`
- RNF-06: Cookie `pedi_auth_refresh_token` com `httpOnly: true`, `secure: true` em prod, `sameSite: 'Lax'`, TTL 7 dias
- RNF-07: Refresh token rotation: cada refresh emite novo cookie httpOnly com TTL 7d resetado
- RNF-08: Proxy valida JWT inline (3 segmentos base64 + `exp > now`) — não substitui verificação de assinatura do backend, mas filtra cedo tokens garbage/expirados

## Critérios de Aceitação

- [x] Login funcional com persistência (access em localStorage + cookie, refresh em cookie httpOnly)
- [x] Logout limpa storage, cookie httpOnly (via server route), e redireciona
- [x] Auto-refresh em 401 deduplicado, via server route que rotaciona cookie
- [x] AuthenticatedLayout funciona em transições client-side e checa adminOnly
- [x] Proxy bloqueia antes do HTML e filtra JWTs inválidos
- [x] AdminOnly esconde UI não-admin
- [x] Refresh em cookie httpOnly (não localStorage) — defesa XSS

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Cookie httpOnly em tudo, inclusive access" | Impossível: o `proxy.ts` precisa ler o access para validar `exp` antes do render. A não-httpOnly do access é custo do proxy server-side. |
| "Refresh em cookie httpOnly é exagero" | TTL de 7 dias. Se XSS capturar, atacante fica com sessão válida por semana. É a defesa primária. |
| "Storage triplo é complicado, simplifica para localStorage" | Perde-se a defesa XSS no refresh, ou perde-se o proxy server-side. O trade-off está documentado. |
| "Logout só limpa localStorage" | Cookie httpOnly precisa ser limpo pelo server route (`Set-Cookie` com `max-age=0`), senão o refresh continua válido no backend e proxy continua liberando acesso. |
| "Refresh em cada 401 está ok" | Sem dedupe, 5 requests paralelos = 5 refreshes. Usar `refreshPromise` compartilhado. |
| "Pode usar fetch direto em componente" | Cliente `lib/api.ts` tem auto-refresh embutido. Fetch direto quebra o contrato. |
| "Token em URL é mais simples" | Vaza em logs, histórico, referer. Nunca fazer. |
| "AuthProvider pode ser client-only" | É Client Component (`'use client'`) por causa de `useState`/`useEffect`. Server-side é só o proxy. |
| "Proxy valida JWT, então backend pode confiar" | Proxy NÃO valida assinatura (não tem `JWT_SECRET`). Backend sempre valida assinatura em `JwtStrategy`. Proxy só filtra tokens garbage/expirados. |

## Red Flags

- `fetch` direto sem usar `api.*` em componente (perde auto-refresh)
- `httpOnly: false` no cookie sem justificativa (manter só para `pedi_auth_access_token` lido pelo proxy)
- Refresh token persistido em localStorage (XSS) — usar `clearAuthStorage()` na migração
- Refresh sem dedupe (cada 401 chama `/api/auth/refresh` separadamente)
- Logout que não limpa o cookie `pedi_auth_refresh_token` (chamar server route)
- `AuthenticatedLayout` faltando em nova rota `/dashboard/*` ou `/restaurantes/*`
- `proxy.ts` matcher não cobrindo nova rota protegida
- Token em log ou `localStorage.getItem` dumpado em devtools visível
- AuthProvider tentando buscar user no SSR sem hidratação
- `document.cookie = '...; HttpOnly'` (browser recusa, precisa server route)

## Verificação

- [ ] `npm run lint` sem erros
- [ ] `npm run test:coverage` ≥ 80%
- [ ] E2E (Playwright): login → dashboard visível; logout → /login
- [ ] E2E: 401 deduplicado (mockar 401 duas vezes, ver 1 refresh)
- [ ] E2E: cookie `pedi_auth_refresh_token` está `httpOnly` (não acessível via `document.cookie` no browser)
- [ ] E2E: cookie `pedi_auth_access_token` presente após login (acessível, lido pelo proxy)
- [ ] E2E: cookies limpos após logout
- [ ] E2E: rota protegida sem cookie → redirect antes do HTML
- [ ] E2E: JWT garbage (`xxx.yyy.zzz`) → redirect (proxy filtra)
- [ ] E2E: JWT expirado → redirect (proxy filtra via `exp`)
- [ ] Teste unitário de `useAuth` com mock de `api`
- [ ] Teste unitário de `AuthenticatedLayout` (renderiza children quando autenticado, redirect quando não; adminOnly respeitado)
