'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Modal, ConfirmDialog } from '@/components/ui';
import { api, Permissao } from '@/lib/api';
import { useToast } from '@/lib/notifications';
import { Key, Plus, RefreshCw, Trash2, Edit2 } from 'lucide-react';

export default function PermissoesPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaChave, setNovaChave] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nome: string } | null>(null);

  const carregarPermissoes = async () => {
    setLoading(true);
    setError(null);
    try {
      const dados = await api.permissoes.listarTodos();
      setPermissoes(dados);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar';
      setError(msg);
      notify(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPermissoes();
  }, []);

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
      notify('Permissão criada com sucesso', 'success');
      await carregarPermissoes();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao criar', 'error');
    } finally {
      setCreating(false);
    }
  };

  const requestDelete = (id: string, nome: string) => {
    setConfirmDelete({ id, nome });
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { id, nome } = confirmDelete;
    try {
      await api.permissoes.deletar(id);
      setPermissoes((prev) => prev.filter((p) => p.id !== id));
      notify(`Permissão "${nome}" excluída com sucesso`, 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao excluir', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleChaveChange = (value: string) => {
    // Formato esperado pela API: `recurso:acao` (letras minúsculas, dígitos).
    // Qualquer caractere inválido vira `_` no segmento recurso; mantemos o
    // `:` separador para que a chave respeite o regex do DTO no backend.
    const lower = value.toLowerCase();
    const [recurso = '', acao = ''] = lower.split(':');
    const sanitizedRecurso = recurso.replace(/[^a-z0-9]/g, '');
    const sanitizedAcao = acao.replace(/[^a-z0-9_]/g, '');
    setNovaChave(`${sanitizedRecurso}:${sanitizedAcao}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-warning to-amber-600 flex items-center justify-center shadow-md">
              <Key className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Permissões</h1>
              <p className="text-text-secondary mt-0.5">Gerencie permissões de acesso</p>
            </div>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Nova Permissão
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-3 p-4 bg-background rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {loading ? '-' : permissoes.length}
              </p>
              <p className="text-sm text-text-secondary">Total</p>
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nova Permissão">
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
            placeholder="recurso:acao"
            required
          />
          <p className="text-xs text-text-secondary -mt-2">
            A chave é usada internamente. Use o formato recurso:acao (minúsculas)
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
      </Modal>

      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          {permissoes.length === 0 && !loading ? (
            <div className="py-20 text-center min-w-full">
              <div className="w-20 h-20 rounded-full bg-warning/5 flex items-center justify-center mx-auto mb-5">
                <Key className="w-10 h-10 text-warning/40" />
              </div>
              <p className="text-text-primary font-medium mb-1">Nenhuma permissão cadastrada</p>
              <p className="text-text-secondary text-sm mb-6">
                Comece adicionando sua primeira permissão
              </p>
              <Button variant="secondary" onClick={carregarPermissoes}>
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
                    Chave
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {permissoes.map((permissao) => (
                  <tr
                    key={permissao.id}
                    className="hover:bg-warning/5 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                          <Key className="w-6 h-6 text-warning" />
                        </div>
                        <span className="font-semibold text-text-primary">{permissao.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <code className="text-sm font-mono bg-background px-3 py-1.5 rounded-lg text-text-secondary">
                        {permissao.chave}
                      </code>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-secondary">
                      {permissao.descricao || (
                        <span className="text-text-secondary/50">Sem descrição</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/permissoes/${permissao.id}`)}
                          aria-label={`Editar permissão ${permissao.nome}`}
                        >
                          <Edit2 className="w-4 h-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => requestDelete(permissao.id, permissao.nome)}
                          className="text-error hover:bg-error/10"
                          aria-label={`Excluir permissão ${permissao.nome}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {permissoes.length > 0 && (
          <div className="px-5 py-4 bg-background/50 border-t border-border flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              {permissoes.length} permissão{permissoes.length !== 1 ? 's' : ''} encontrada
              {permissoes.length !== 1 ? 's' : ''}
            </p>
            <Button variant="ghost" size="sm" onClick={carregarPermissoes} loading={loading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Excluir permissão"
        description={
          confirmDelete
            ? `Tem certeza que deseja excluir a permissão "${confirmDelete.nome}"? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Excluir"
      />
    </div>
  );
}
