'use client';

import { useState, useEffect } from 'react';
import { api, Usuario } from '@/lib/api';
import { Button, Input } from '@/components/ui';
import { User, Plus, RefreshCw, Trash2, Edit2, X, Users } from 'lucide-react';

interface UsuarioListProps {
  onUsuarioCriado?: () => void;
}

export function UsuarioList({ onUsuarioCriado }: UsuarioListProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [creating, setCreating] = useState(false);

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

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoEmail.trim() || !novaSenha.trim()) return;

    setCreating(true);
    try {
      await api.usuarios.criar({ nome: novoNome, email: novoEmail, senha: novaSenha });
      setNovoNome('');
      setNovoEmail('');
      setNovaSenha('');
      setShowModal(false);
      onUsuarioCriado?.();
      await carregarUsuarios();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar');
    } finally {
      setCreating(false);
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-error" />
          {error}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Novo Usuário
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-background rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Nome"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Nome completo"
                required
              />
              <Input
                label="Email"
                type="email"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
              <Input
                label="Senha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Senhatemporary"
                required
              />
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={creating} className="flex-1">
                  Criar Usuário
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          {usuarios.length === 0 && !loading ? (
            <div className="py-20 text-center min-w-full">
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-5">
                <Users className="w-10 h-10 text-primary/40" />
              </div>
              <p className="text-text-primary font-medium mb-1">Nenhum usuário cadastrado</p>
              <p className="text-text-secondary text-sm mb-6">
                Comece adicionando seu primeiro usuário
              </p>
              <Button variant="secondary" onClick={carregarUsuarios}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar Lista
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-background to-background/80 border-b border-border">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usuarios.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="hover:bg-primary/5 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <span className="font-semibold text-text-primary">{usuario.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-secondary">{usuario.email}</td>
                    <td className="px-4 py-4 text-sm text-text-secondary">
                      {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            (window.location.href = `/dashboard/usuarios/${usuario.id}`)
                          }
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(usuario.id, usuario.nome)}
                          className="text-error hover:bg-error/10"
                        >
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
        {usuarios.length > 0 && (
          <div className="px-5 py-4 bg-background/50 border-t border-border flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              {usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} encontrado
              {usuarios.length !== 1 ? 's' : ''}
            </p>
            <Button variant="ghost" size="sm" onClick={carregarUsuarios} loading={loading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
