'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/MainLayout';
import { Button, Input } from '@/components/ui';
import { api, Permissao } from '@/lib/api';
import { Key, Plus, RefreshCw, X, Trash2, Edit2 } from 'lucide-react';

export default function PermissoesPage() {
  const router = useRouter();
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaChave, setNovaChave] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [creating, setCreating] = useState(false);

  const carregarPermissoes = async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await api.permissoes.listarTodos();
      setPermissoes(dados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novaChave.trim()) return;

    setCreating(true);
    try {
      await api.permissoes.criar({ nome: novoNome, chave: novaChave, descricao: novaDescricao });
      setNovoNome('');
      setNovaChave('');
      setNovaDescricao('');
      setShowModal(false);
      await carregarPermissoes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Deseja excluir a permissão "${nome}"?`)) return;
    try {
      await api.permissoes.deletar(id);
      setPermissoes((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const handleChaveChange = (value: string) => {
    const formatted = value.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    setNovaChave(formatted);
  };

  return (
    <MainLayout title="Permissões">
      <div>
        <div className="flex justify-between items-center mb-6">
          <Button variant="secondary" onClick={carregarPermissoes} loading={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Carregar
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Permissão
          </Button>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl border border-border">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Nova Permissão
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
                  label="Nome da Permissão"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Visualizar Pedidos"
                  required
                />
                <Input
                  label="Chave"
                  value={novaChave}
                  onChange={(e) => handleChaveChange(e.target.value)}
                  placeholder="VISUALIZAR_PEDIDOS"
                  required
                />
                <p className="text-xs text-text-secondary -mt-2">
                  A chave é usada internamente. Use CAIXA_ALTA_COM_UNDERSCORE
                </p>
                <Input
                  label="Descrição"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  placeholder="Descrição opcional"
                />
                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={creating} className="flex-1">
                    Criar Permissão
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
          {permissoes.length === 0 && !loading ? (
            <div className="py-16 text-center">
              <Key className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
              <p className="text-text-secondary mb-4">Nenhuma permissão encontrada</p>
              <Button variant="secondary" onClick={carregarPermissoes}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Carregar Permissões
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-background/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Chave</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Descrição</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {permissoes.map((permissao) => (
                  <tr key={permissao.id} className="hover:bg-background/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                          <Key className="w-5 h-5 text-secondary" />
                        </div>
                        <span className="font-medium text-text-primary">{permissao.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <code className="px-2 py-1 bg-background rounded text-sm font-mono text-text-secondary">
                        {permissao.chave}
                      </code>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-secondary">
                      {permissao.descricao || <span className="text-text-secondary/50">Sem descrição</span>}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/permissoes/${permissao.id}`)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(permissao.id, permissao.nome)} className="text-error hover:bg-error/10">
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
    </MainLayout>
  );
}
