const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const ACCESS_TOKEN_KEY = 'pedi_auth_access_token';
const REFRESH_TOKEN_KEY = 'pedi_auth_refresh_token';

let refreshInProgress = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInProgress && refreshPromise) {
    return refreshPromise;
  }

  refreshInProgress = true;
  refreshPromise = (async () => {
    try {
      // Server route lê o refresh token do cookie httpOnly e devolve o novo par.
      // O cliente atualiza localStorage para o próximo request usar o novo access token.
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        return null;
      }

      const data = (await res.json()) as {
        accessToken: string;
        refreshToken?: string;
        expiresIn?: number;
      };
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      }
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshInProgress = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
}

export interface CriarUsuarioDto {
  nome: string;
  email: string;
  senha: string;
}

export interface AtualizarUsuarioDto {
  nome?: string;
  email?: string;
  senha?: string;
}

export interface Permissao {
  id: string;
  nome: string;
  chave: string;
  descricao?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
}

export interface CriarPermissaoDto {
  nome: string;
  chave: string;
  descricao?: string;
}

export interface AtualizarPermissaoDto {
  nome?: string;
  chave?: string;
  descricao?: string;
}

export interface Perfil {
  id: string;
  nome: string;
  descricao?: string;
  permissoes: Permissao[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
}

export interface CriarPerfilDto {
  nome: string;
  descricao?: string;
}

export interface AtualizarPerfilDto {
  nome?: string;
  descricao?: string;
}

export interface Restaurante {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  horarioAbertura: string;
  horarioFechamento: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
}

export interface CriarRestauranteDto {
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  horarioAbertura: string;
  horarioFechamento: string;
}

export interface AtualizarRestauranteDto {
  nome?: string;
  cnpj?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  horarioAbertura?: string;
  horarioFechamento?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson<T>(
  url: string,
  options?: RequestInit,
  retryWithRefresh = true,
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options?.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401 && retryWithRefresh) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const newHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newToken}`,
        ...options?.headers,
      };
      const retryRes = await fetch(url, {
        ...options,
        headers: newHeaders,
      });
      if (!retryRes.ok) {
        const error = await retryRes.json().catch(() => ({ message: retryRes.statusText }));
        throw new Error(error.message || `HTTP ${retryRes.status}`);
      }
      if (retryRes.status === 204) return undefined as unknown as T;
      return retryRes.json();
    }
    const error = await res.json().catch(() => ({ message: 'Unauthorized' }));
    throw new Error(error.message || 'Unauthorized');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, senha: string) =>
      fetchJson<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        tokenType: string;
      }>(`${API_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      }),

    me: () => fetchJson<Usuario>(`${API_URL}/auth/me`),

    logout: () => fetchJson<void>(`${API_URL}/auth/logout`, { method: 'POST' }),
  },

  usuarios: {
    listarTodos: () => fetchJson<Usuario[]>(`${API_URL}/users`),

    listarUm: (id: string) => fetchJson<Usuario>(`${API_URL}/users/${id}`),

    listarPorEmail: (email: string) => fetchJson<Usuario>(`${API_URL}/users/email/${email}`),

    criar: (data: CriarUsuarioDto) =>
      fetchJson<Usuario>(`${API_URL}/users`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    atualizar: (id: string, data: AtualizarUsuarioDto) =>
      fetchJson<Usuario>(`${API_URL}/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    deletar: (id: string) =>
      fetchJson<void>(`${API_URL}/users/${id}`, {
        method: 'DELETE',
      }),
  },

  permissoes: {
    listarTodos: () => fetchJson<Permissao[]>(`${API_URL}/permissoes`),

    listarUm: (id: string) => fetchJson<Permissao>(`${API_URL}/permissoes/${id}`),

    criar: (data: CriarPermissaoDto) =>
      fetchJson<Permissao>(`${API_URL}/permissoes`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    atualizar: (id: string, data: AtualizarPermissaoDto) =>
      fetchJson<Permissao>(`${API_URL}/permissoes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    deletar: (id: string) =>
      fetchJson<void>(`${API_URL}/permissoes/${id}`, {
        method: 'DELETE',
      }),
  },

  perfis: {
    listarTodos: () => fetchJson<Perfil[]>(`${API_URL}/perfis`),

    listarUm: (id: string) => fetchJson<Perfil>(`${API_URL}/perfis/${id}`),

    criar: (data: CriarPerfilDto) =>
      fetchJson<Perfil>(`${API_URL}/perfis`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    atualizar: (id: string, data: AtualizarPerfilDto) =>
      fetchJson<Perfil>(`${API_URL}/perfis/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    deletar: (id: string) =>
      fetchJson<void>(`${API_URL}/perfis/${id}`, {
        method: 'DELETE',
      }),

    associarPermissoes: (id: string, permissoesIds: string[]) =>
      fetchJson<Perfil>(`${API_URL}/perfis/${id}/permissoes`, {
        method: 'POST',
        body: JSON.stringify({ permissoesIds }),
      }),

    desassociarPermissao: (id: string, permissaoId: string) =>
      fetchJson<void>(`${API_URL}/perfis/${id}/permissoes/${permissaoId}`, {
        method: 'DELETE',
      }),
  },

  restaurantes: {
    listarTodos: () => fetchJson<Restaurante[]>(`${API_URL}/restaurants`),

    listarUm: (id: string) => fetchJson<Restaurante>(`${API_URL}/restaurants/${id}`),

    criar: (data: CriarRestauranteDto) =>
      fetchJson<Restaurante>(`${API_URL}/restaurants`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    atualizar: (id: string, data: AtualizarRestauranteDto) =>
      fetchJson<Restaurante>(`${API_URL}/restaurants/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    deletar: (id: string) =>
      fetchJson<void>(`${API_URL}/restaurants/${id}`, {
        method: 'DELETE',
      }),
  },
};
