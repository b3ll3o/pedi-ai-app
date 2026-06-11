---
name: auth
description: Domínio de autenticação do frontend (pedi-ai-app) — AuthContext, dual storage localStorage+cookie, ProtectedRoute, auto-refresh de token, fluxo de login/logout. Carregue ao mexer em auth, login, refresh, logout, ou fluxo de sessão.
type: domain
status: implemented
domain: auth
---

# Autenticação Frontend (auth)

## Visão Geral

Domínio de autenticação do app: `AuthContext` (Provider + hook), dual storage (localStorage + cookie), cliente API com auto-refresh em 401, `ProtectedRoute` e `AdminOnly` para autorização client-side, e proxy server-side (`src/proxy.ts`) como gate.

## Quando Usar

- Mexer em login, logout, refresh
- Adicionar nova rota protegida
- Alterar storage de tokens
- Investigar bug de 401/403 em requisições
- Adicionar novo claim ao contexto (ex: `perfil`)

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
  refreshToken: () => Promise<void>;
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
4. AuthContext → POST /auth/login
5. Recebe { accessToken, refreshToken }
6. Armazena em localStorage (cliente) e cookie (lido pelo proxy)
7. setUser(dados do usuário + accessToken)
8. Redirect para /dashboard
```

### Fluxo de Logout

```
1. Click em logout na Sidebar
2. AuthContext.logout()
3. Limpa localStorage + cookie
4. setUser(null)
5. Redirect para /login
```

### Fluxo de Auto-Refresh (401)

```
Cliente API (lib/api.ts):
- fetchJson() adiciona Authorization: Bearer <accessToken>
- Em 401, chama refreshAccessToken()
- Deduplicação: múltiplas 401 simultâneas compartilham 1 refresh
- Em falha de refresh, limpa storage e propaga erro
```

## Componentes de Proteção

| Componente | Onde | Comportamento |
|------------|------|---------------|
| `proxy.ts` (server) | `src/proxy.ts` | Redireciona `/dashboard/*` e `/restaurantes/*` sem cookie → `/login` |
| `ProtectedRoute` (client) | `src/components/auth/` | Redireciona via `router.push` se `!isAuthenticated` |
| `AdminOnly` (visual) | `src/components/auth/` | Renderiza `null` se não for ADMIN (esconde menu) |

**Defense in depth:** proxy bloqueia antes do HTML, ProtectedRoute cobre transições client-side, AdminOnly esconde UI.

## Requisitos Funcionais (RF)

- RF-01: Login persiste tokens e redireciona para `/dashboard`
- RF-02: Logout limpa storage, cookie, e redireciona para `/login`
- RF-03: Refresh automático em 401 com deduplicação
- RF-04: Rotas protegidas redirecionam para `/login` se sem sessão
- RF-05: Sidebar mostra nome do usuário + botão logout
- RF-06: `useAuth().isAuthenticated` é fonte de verdade client-side

## Requisitos Não-Funcionais (RNF)

- RNF-01: **Dual storage intencional** — `localStorage` para cliente, `cookie` para proxy server-side (exceção documentada: `httpOnly: false` é necessário para o proxy ler)
- RNF-02: Access token nunca exposto em logs
- RNF-03: `refreshInProgress` / `refreshPromise` deduplica chamadas paralelas
- RNF-04: Falha de refresh = logout automático (limpa storage + redirect)
- RNF-05: Cookie `pedi_auth_access_token` com `secure: true` em prod, `sameSite: 'Lax'`

## Storage Keys

```
localStorage:
  pedi_auth_access_token
  pedi_auth_refresh_token
  pedi_auth_user

document.cookie:
  pedi_auth_access_token (lido pelo proxy server-side)
```

## Critérios de Aceitação

- [x] Login funcional com persistência
- [x] Logout limpa storage e redireciona
- [x] Auto-refresh em 401 deduplicado
- [x] ProtectedRoute funciona em transições client-side
- [x] Proxy bloqueia antes do HTML
- [x] AdminOnly esconde UI não-admin

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Cookie httpOnly: false é vulnerável" | É exceção documentada do PediAI por causa do `proxy.ts` server-side. Não é o padrão recomendado em outros contextos. |
| "Logout só limpa localStorage" | Cookie precisa ser limpo também, senão proxy vai continuar liberando acesso. |
| "Refresh em cada 401 está ok" | Sem dedupe, 5 requests paralelos = 5 refreshes. Usar `refreshPromise` compartilhado. |
| "Pode usar fetch direto em componente" | Cliente `lib/api.ts` tem auto-refresh embutido. Fetch direto quebra o contrato. |
| "Token em URL é mais simples" | Vaza em logs, histórico, referer. Nunca fazer. |
| "AuthProvider pode ser client-only" | É Client Component (`'use client'`) por causa de `useState`/`useEffect`. Server-side é só o proxy. |

## Red Flags

- `fetch` direto sem usar `api.*` em componente
- `httpOnly: false` no cookie sem justificativa (manter só para `pedi_auth_access_token` lido pelo proxy)
- Refresh sem dedupe (cada 401 chama `/auth/refresh` separadamente)
- Logout que não limpa o cookie `pedi_auth_access_token`
- `ProtectedRoute` faltando em nova rota `/dashboard/*` ou `/restaurantes/*`
- `proxy.ts` matcher não cobrindo nova rota protegida
- Token em log ou `localStorage.getItem` dumpado em devtools visível
- AuthProvider tentando buscar user no SSR sem hidratação

## Verificação

- [ ] `npm run lint` sem erros
- [ ] `npm run test:coverage` ≥ 80%
- [ ] E2E (Playwright): login → dashboard visível; logout → /login
- [ ] E2E: 401 deduplicado (mockar 401 duas vezes, ver 1 refresh)
- [ ] E2E: cookie `pedi_auth_access_token` presente após login
- [ ] E2E: cookie limpo após logout
- [ ] E2E: rota protegida sem cookie → redirect antes do HTML
- [ ] Teste unitário de `useAuth` com mock de `api`
- [ ] Teste unitário de `ProtectedRoute` (renderiza children quando autenticado, redirect quando não)
