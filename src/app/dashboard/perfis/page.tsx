'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { api, Perfil } from '@/lib/api';
import { Shield, Plus, RefreshCw, X, Trash2, Edit2 } from 'lucide-react';

export default function PerfisPage() {
  const router = useRouter();
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    carregarPerfis();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Button variant="secondary" onClick={carregarPerfis} loading={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Carregar
        </Button>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Perfil
        </Button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <span>{error}</span>
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
            <div className="py-16 text-center min-w-full">
              <Shield className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
              <p className="text-text-secondary mb-4">Nenhum perfil encontrado</p>
              <Button variant="secondary" onClick={carregarPerfis}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Carregar Perfis
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-background/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Descrição</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">Permissões</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {perfis.map((perfil) => (
                  <tr key={perfil.id} className="hover:bg-background/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-text-primary">{perfil.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-secondary">
                      {perfil.descricao || <span className="text-text-secondary/50">Sem descrição</span>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {perfil.permissoes?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/perfis/${perfil.id}`)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(perfil.id, perfil.nome)} className="text-error hover:bg-error/10">
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
    </div>
  );
}
