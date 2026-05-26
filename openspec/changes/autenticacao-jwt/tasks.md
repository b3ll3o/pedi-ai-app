# Tasks - Autenticação Frontend (pedi-ai-app)

## Context

Implementar autenticação JWT no frontend Next.js, substituindo sistema fake atual.

## Tasks de Implementação

### Fase 1: Context e Hooks

- [ ] Criar `src/lib/auth-context.tsx` com AuthContext
  - Estado: user, accessToken, isAuthenticated, isLoading
  - Métodos: login, logout, refreshToken, getAccessToken
  - Boot from localStorage on mount
- [ ] Criar `src/hooks/useAuth.ts` (export do context)

### Fase 2: ProtectedRoute

- [ ] Criar `src/components/auth/ProtectedRoute.tsx`
- [ ] Verifica isAuthenticated
- [ ] Redirect para /login se não autenticado
- [ ] Props: children (elementos protegidos)

### Fase 3: API Client

- [ ] Atualizar `src/lib/api.ts` com request interceptor (add Bearer token)
- [ ] Adicionar response interceptor para tratar 401
- [ ] Implementar refresh token automático no interceptor

### Fase 4: Login Page

- [ ] Atualizar `src/app/login/page.tsx`:
  - Usar AuthContext para login
  - Validação de input
  - Loading state durante login
  - Error display
  - Redirect para /dashboard após login

### Fase 5: Proteção de Rotas

- [ ] Proteger `/dashboard` com ProtectedRoute
- [ ] Proteger `/pedidos` com ProtectedRoute
- [ ] Proteger `/usuarios` com ProtectedRoute
- [ ] Redirecionar /login → /dashboard se já logado

### Fase 6: Logout

- [ ] Adicionar botão logout na Sidebar
- [ ] Integrar logout com AuthContext

## Critérios de Aceitação

- [ ] Usuário pode fazer login com email + senha
- [ ] Login inválido mostra mensagem de erro
- [ ] Após login, redirect para /dashboard
- [ ] Rotas protegidas redirecionam para /login
- [ ] Logout limpa sessão e redireciona para /login
- [ ] Access token é enviado em todas requisições API
- [ ] Refresh token automático após expiração

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| src/lib/auth-context.tsx | Criar |
| src/hooks/useAuth.ts | Criar |
| src/components/auth/ProtectedRoute.tsx | Criar |
| src/lib/api.ts | Atualizar |
| src/app/login/page.tsx | Atualizar |
| src/components/Sidebar.tsx | Atualizar |

## Arquivos a Deletar

- src/lib/auth.tsx (substituído por auth-context.tsx)
