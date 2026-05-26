# Spec - Autenticação Frontend

## Interface de Autenticação

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

### useAuth Hook

```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

## Fluxo de Login

```
1. Usuário acessa /login
2. Preenche email + senha
3. Chama login(email, senha)
4. AuthContext → POST /auth/login
5. Recebe { accessToken, refreshToken }
6. Armazena em localStorage
7. setUser(dados do usuário + accessToken)
8. Redirect para /dashboard
```

## Fluxo de Logout

```
1. Usuário clica logout na Sidebar
2. AuthContext.logleout()
3. Limpa localStorage
4. setUser(null)
5. Redirect para /login
```

## ProtectedRoute

```typescript
<ProtectedRoute redirectTo="/login">
  <Dashboard />
</ProtectedRoute>
```

Redireciona se `!isAuthenticated`.

## API Interceptor

```typescript
// Request: adiciona Bearer token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: trata 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await refreshToken();
        // Retry request
      } catch {
        logout();
      }
    }
    return Promise.reject(error);
  }
);
```

## Estados

### LoginPage

| Estado | UI |
|--------|-----|
| Idle | Form com email + senha |
| Loading | Spinner no botão + inputs disabled |
| Error | Mensagem de erro em vermelho |
| Success | Redirect para /dashboard |

### Rotas Protegidas

| Rota | Comportamento |
|------|---------------|
| /dashboard | Exige auth, senão /login |
| /pedidos | Exige auth, senão /login |
| /usuarios | Exige auth, senão /login |
| /login | Se logado, redirect → /dashboard |

## Storage Keys

```
pedi_auth_access_token
pedi_auth_refresh_token
pedi_auth_user
```

## logout na Sidebar

Sidebar deve mostrar:
- Nome do usuário logado
- Botão logout com ícone
