'use client';

import { useState } from 'react';
import { api, Usuario } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function UsuarioList() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await api.usuarios.listarTodos();
      setUsuarios(dados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este usuário?')) return;
    try {
      await api.usuarios.deletar(id);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={carregarUsuarios}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Carregar Usuários
        </button>
        <button
          onClick={() => router.push('/usuarios/novo')}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Novo Usuário
        </button>
      </div>

      {error && (
        <div className="bg-error/10 text-error px-4 py-3 rounded-lg mb-4">{error}</div>
      )}

      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-background">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Nome</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Criado em</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-background/50">
                <td className="px-4 py-3 text-sm font-medium text-text-primary">{usuario.nome}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{usuario.email}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => router.push(`/usuarios/${usuario.id}`)}
                    className="text-primary hover:underline text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(usuario.id)}
                    className="text-error hover:underline text-sm"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                  Nenhum usuário encontrado. Clique em &quot;Carregar Usuários&quot; para buscar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
