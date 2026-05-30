'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { api, Perfil } from '@/lib/api';
import { Shield, Plus, RefreshCw, X, Trash2, Edit2 } from 'lucide-react';

export default function PerfisPage() {
  const router = useRouter();
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [creating, setCreating] = useState(false);

  const carregarPerfis = async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await api.perfis.listarTodos();
      setPerfis(dados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPerfis();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    setCreating(true);
    try {
      await api.perfis.criar({ nome: novoNome, descricao: novaDescricao });
      setNovoNome('');
      setNovaDescricao('');
      setShowModal(false);
      await carregarPerfis();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Deseja excluir o perfil "${nome}"?`)) return;
    try {
      await api.perfis.deletar(id);
      setPerfis((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center shadow-md">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Perfis</h1>
              <p className="text-text-secondary mt-0.5">Gerencie perfis de acesso</p>
            </div>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Novo Perfil
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-3 p-4 bg-background rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {loading ? '-' : perfis.length}
              </p>
              <p className="text-sm text-text-secondary">Total</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {loading ? '-' : new Set(perfis.flatMap((p) => p.permissoes || [])).size}
              </p>
              <p className="text-sm text-text-secondary">Permissões únicas</p>
            </div>
          </div>
        </div>
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
                <Shield className="w-5 h-5 text-primary" />
                Novo Perfil
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
                label="Nome do Perfil"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Administrador"
                required
              />
              <Input
                label="Descrição"
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                placeholder="Descrição opcional do perfil"
              />
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={creating} className="flex-1">
                  Criar Perfil
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
          {perfis.length === 0 && !loading ? (
            <div className="py-20 text-center min-w-full">
              <div className="w-20 h-20 rounded-full bg-secondary/5 flex items-center justify-center mx-auto mb-5">
                <Shield className="w-10 h-10 text-secondary/40" />
              </div>
              <p className="text-text-primary font-medium mb-1">Nenhum perfil cadastrado</p>
              <p className="text-text-secondary text-sm mb-6">
                Comece adicionando seu primeiro perfil
              </p>
              <Button variant="secondary" onClick={carregarPerfis}>
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
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Permissões
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {perfis.map((perfil) => (
                  <tr
                    key={perfil.id}
                    className="hover:bg-secondary/5 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                          <Shield className="w-6 h-6 text-secondary" />
                        </div>
                        <span className="font-semibold text-text-primary">{perfil.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-secondary">
                      {perfil.descricao || (
                        <span className="text-text-secondary/50">Sem descrição</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {perfil.permissoes?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/perfis/${perfil.id}`)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(perfil.id, perfil.nome)}
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
        {perfis.length > 0 && (
          <div className="px-5 py-4 bg-background/50 border-t border-border flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              {perfis.length} perfil{perfis.length !== 1 ? 's' : ''} encontrado
              {perfis.length !== 1 ? 's' : ''}
            </p>
            <Button variant="ghost" size="sm" onClick={carregarPerfis} loading={loading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
