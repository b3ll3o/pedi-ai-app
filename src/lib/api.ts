const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const api = {
  usuarios: {
    listarTodos: () =>
      fetchJson<Usuario[]>(`${API_URL}/users`),

    listarUm: (id: string) =>
      fetchJson<Usuario>(`${API_URL}/users/${id}`),

    listarPorEmail: (email: string) =>
      fetchJson<Usuario>(`${API_URL}/users/email/${email}`),

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
    listarTodos: () =>
      fetchJson<Permissao[]>(`${API_URL}/permissoes`),

    listarUm: (id: string) =>
      fetchJson<Permissao>(`${API_URL}/permissoes/${id}`),

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
    listarTodos: () =>
      fetchJson<Perfil[]>(`${API_URL}/perfis`),

    listarUm: (id: string) =>
      fetchJson<Perfil>(`${API_URL}/perfis/${id}`),

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
};
