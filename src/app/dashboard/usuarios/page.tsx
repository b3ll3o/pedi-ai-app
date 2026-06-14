'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Usuario } from '@/lib/api';
import { Button, Input, Modal, ConfirmDialog, CrudPageHeader, RowActions } from '@/components/ui';
import { useAsyncList } from '@/lib/hooks/useAsyncList';
import { useToast } from '@/lib/notifications';
import { User, Plus, RefreshCw, Users } from 'lucide-react';

export default function UsuariosPage() {
  const router = useRouter();
  const { notify } = useToast();
  const {
    data: usuarios,
    loading,
    error,
    reload,
    setData,
  } = useAsyncList<Usuario>((signal) => api.usuarios.listarTodos(signal));
  const [showModal, setShowModal] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nome: string } | null>(null);

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
      await reload();
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
      await api.usuarios.deletar(id);
      setData((prev) => prev.filter((u) => u.id !== id));
      notify(`Usuário "${nome}" excluído com sucesso`, 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao excluir', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const stats = [
    {
      label: 'Total',
      value: usuarios.length,
      icon: Users,
      color: 'bg-primary/10 text-primary',
    },
  ];

  return (
    <div className="space-y-6">
      <CrudPageHeader
        icon={Users}
        title="Usuários"
        description="Gerencie os usuários do sistema"
        accent="primary"
        actions={
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Novo Usuário
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Novo Usuário">
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
      </Modal>

      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          {usuarios.length === 0 && !loading ? (
            <div data-testid="empty-state" className="py-20 text-center min-w-full">
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-5">
                <Users className="w-10 h-10 text-primary/40" />
              </div>
              <p className="text-text-primary font-medium mb-1">Nenhum usuário cadastrado</p>
              <p className="text-text-secondary text-sm mb-6">
                Comece adicionando seu primeiro usuário
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
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    Criado em
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
                      <RowActions
                        editLabel={`Editar usuário ${usuario.nome}`}
                        deleteLabel={`Excluir usuário ${usuario.nome}`}
                        onEdit={() => router.push(`/dashboard/usuarios/${usuario.id}`)}
                        onDelete={() => requestDelete(usuario.id, usuario.nome)}
                      />
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
            <Button variant="ghost" size="sm" onClick={reload} loading={loading}>
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
        title="Excluir usuário"
        description={`Tem certeza que deseja excluir o usuário "${confirmDelete?.nome ?? ''}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
      />
    </div>
  );
}
