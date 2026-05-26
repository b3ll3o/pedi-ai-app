'use client';

import { useState } from 'react';
import { api, Usuario } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { User, Plus, RefreshCw, Trash2, Edit2 } from 'lucide-react';

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

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Deseja excluir o usuário "${nome}"?`)) return;
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
        <Button variant="secondary" onClick={carregarUsuarios} loading={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Carregar
        </Button>
        <Button onClick={() => router.push('/dashboard/usuarios/novo')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        {usuarios.length === 0 && !loading ? (
          <div className="py-16 text-center">
            <User className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
            <p className="text-text-secondary mb-4">Nenhum usuário encontrado</p>
            <Button variant="secondary" onClick={carregarUsuarios}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Carregar Usuários
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-background/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Nome</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Criado em</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-background/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-text-primary">{usuario.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-secondary">{usuario.email}</td>
                  <td className="px-4 py-4 text-sm text-text-secondary">
                    {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/usuarios/${usuario.id}`)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(usuario.id, usuario.nome)} className="text-error hover:bg-error/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
