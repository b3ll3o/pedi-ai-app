'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Modal, ConfirmDialog, CrudPageHeader, RowActions } from '@/components/ui';
import { api, Perfil } from '@/lib/api';
import { useAsyncList } from '@/lib/hooks/useAsyncList';
import { Shield, Plus, RefreshCw } from 'lucide-react';

export default function PerfisPage() {
  const router = useRouter();
  const {
    data: perfis,
    loading,
    error,
    reload,
    setData,
  } = useAsyncList<Perfil>((signal) => api.perfis.listarTodos(signal));
  const [showModal, setShowModal] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nome: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    setCreating(true);
    try {
      await api.perfis.criar({ nome: novoNome, descricao: novaDescricao });
      setNovoNome('');
      setNovaDescricao('');
      setShowModal(false);
      await reload();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    setConfirmDelete({ id, nome });
  };

  const confirmarDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.perfis.deletar(confirmDelete.id);
      setData((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const stats = [
    {
      label: 'Total',
      value: perfis.length,
      icon: Shield,
      color: 'bg-secondary/10 text-secondary',
    },
    {
      label: 'Permissões únicas',
      value: new Set(perfis.flatMap((p) => p.permissoes || [])).size,
      icon: Plus,
      color: 'bg-primary/10 text-primary',
    },
  ];

  return (
    <div className="space-y-6">
      <CrudPageHeader
        icon={Shield}
        title="Perfis"
        description="Gerencie perfis de acesso"
        accent="secondary"
        actions={
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Novo Perfil
          </Button>
        }
        stats={stats}
      />

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-error" />
          {error}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Novo Perfil">
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
      </Modal>

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmarDelete}
        loading={deleting}
        title="Excluir perfil"
        description={`Tem certeza que deseja excluir o perfil "${confirmDelete?.nome ?? ''}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
      />

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
              <Button variant="secondary" onClick={reload}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar Lista
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-background to-background/80 border-b border-border">
                <tr>
                  <th
                    scope="col"
                    className="px-5 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    Nome
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    Descrição
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    Permissões
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
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
                      <RowActions
                        editLabel={`Editar perfil ${perfil.nome}`}
                        deleteLabel={`Excluir perfil ${perfil.nome}`}
                        onEdit={() => router.push(`/dashboard/perfis/${perfil.id}`)}
                        onDelete={() => handleDelete(perfil.id, perfil.nome)}
                      />
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
            <Button variant="ghost" size="sm" onClick={reload} loading={loading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
