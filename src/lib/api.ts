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
};
