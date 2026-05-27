# Tasks - Autenticação Frontend (pedi-ai-app)

## Context

Implementar autenticação JWT no frontend Next.js, substituindo sistema fake atual.

## Tasks de Implementação

### Fase 1: Context e Hooks

- [x] Criar `src/lib/auth-context.tsx` com AuthContext
  - Estado: user, accessToken, isAuthenticated, isLoading
  - Métodos: login, logout, refreshToken, getAccessToken
  - Boot from localStorage on mount
- [x] Criar `src/hooks/useAuth.ts` (export do context)

### Fase 2: ProtectedRoute

- [x] Criar `src/components/auth/ProtectedRoute.tsx`
- [x] Verifica isAuthenticated
- [x] Redirect para /login se não autenticado
- [x] Props: children (elementos protegidos)

### Fase 3: API Client

- [x] Atualizar `src/lib/api.ts` com request interceptor (add Bearer token)
- [x] Adicionar response interceptor para tratar 401
- [x] Implementar refresh token automático no interceptor

### Fase 4: Login Page

- [x] Atualizar `src/app/login/page.tsx`:
  - Usar AuthContext para login
  - Validação de input
  - Loading state durante login
  - Error display
  - Redirect para /dashboard após login

### Fase 5: Proteção de Rotas

- [x] Proteger `/dashboard` com ProtectedRoute (via authenticated layout)
- [x] Proteger `/pedidos` com ProtectedRoute (via authenticated layout)
- [x] Proteger `/usuarios` com ProtectedRoute (via authenticated layout)
- [x] Redirecionar /login → /usuarios (área autenticada) se já logado

### Fase 6: Logout

- [x] Adicionar botão logout na Sidebar
- [x] Integrar logout com AuthContext

## Critérios de Aceitação

- [x] Usuário pode fazer login com email + senha
- [x] Login inválido mostra mensagem de erro
- [x] Após login, redirect para /dashboard
- [x] Rotas protegidas redirecionam para /login
- [x] Logout limpa sessão e redireciona para /login
- [x] Access token é enviado em todas requisições API
- [x] Refresh token automático após expiração

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
