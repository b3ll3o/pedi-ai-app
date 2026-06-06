'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface AuthUser {
  id: string;
  nome: string;
  email: string;
  perfilId?: string;
  perfil?: {
    id: string;
    nome: string;
  };
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'pedi_auth_access_token';
// Refresh token NÃO é armazenado em localStorage — o cookie httpOnly
// (setado pela rota /api/auth/login) é a única fonte da verdade. Manter
// o refresh no localStorage seria uma porta de entrada para XSS obter
// um token válido por 7 dias.
const USER_KEY = 'pedi_auth_user';

function clearAuthStorage() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Limpa chave legacy de refresh token (versões anteriores ao fix de XSS).
  localStorage.removeItem('pedi_auth_refresh_token');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedToken || !storedUser) {
      setIsLoading(false);
      return;
    }

    // Hidrata estado imediatamente do storage para evitar flicker de loading.
    // Em paralelo, valida o token via /auth/me e usa a resposta FRESCA (não o
    // JSON armazenado) para refletir mudanças recentes (perfil, nome, etc).
    try {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser));
    } catch {
      // JSON corrompido no storage — limpa e considera deslogado
      clearAuthStorage();
      setAccessToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${storedToken}` },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          // Token inválido/expirado — descarta storage
          clearAuthStorage();
          setAccessToken(null);
          setUser(null);
        } else {
          // Usa dados frescos do backend, não os do localStorage
          const freshUser = (await res.json()) as AuthUser;
          setUser(freshUser);
          localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        }
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          // Erro de rede (não abort) — loga mas mantém storage
          console.warn('[auth] Falha ao validar /auth/me no boot:', err);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const login = async (email: string, senha: string) => {
    // POST para a rota server-side do Next — ela chama o backend e seta os
    // cookies httpOnly. O cliente recebe o access token (TTL curto) e usa
    // para o header Authorization; o refresh fica preso no cookie.
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, senha }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Credenciais inválidas' }));
      throw new Error(error.message || 'Credenciais inválidas');
    }

    const tokens: TokenResponse = await res.json();

    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    // refreshToken fica no cookie httpOnly, NÃO é persistido em localStorage.

    const meRes = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });

    if (!meRes.ok) {
      // Limpar storage e cookies para evitar estado parcial
      clearAuthStorage();
      throw new Error('Falha ao obter dados do usuário');
    }

    const userData: AuthUser = await meRes.json();
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

    setAccessToken(tokens.accessToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      // Server route invalida o refresh no backend e limpa cookies httpOnly.
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token }),
      });
    } catch {
      // ignore logout errors
    } finally {
      clearAuthStorage();
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, isAuthenticated: !!accessToken, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
