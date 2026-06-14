'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ConfirmDialog, CrudPageHeader, RowActions } from '@/components/ui';
import { AdminOnly } from '@/components/auth/AdminOnly';
import { api, Restaurante } from '@/lib/api';
import { useAsyncList } from '@/lib/hooks/useAsyncList';
import { useToast } from '@/lib/notifications';
import { Building2, MapPin, RefreshCw } from 'lucide-react';

export default function RestaurantesPage() {
  const router = useRouter();
  const { notify } = useToast();
  const {
    data: restaurantes,
    loading,
    reload,
    setData,
  } = useAsyncList<Restaurante>((signal) => api.restaurantes.listarTodos(signal));
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nome: string } | null>(null);

  const requestDelete = (id: string, nome: string) => {
    setConfirmDelete({ id, nome });
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { id, nome } = confirmDelete;
    try {
      await api.restaurantes.deletar(id);
      setData((prev) => prev.filter((r) => r.id !== id));
      notify(`Restaurante "${nome}" excluido com sucesso`, 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao excluir', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const stats = [
    {
      label: 'Total',
      value: restaurantes.length,
      icon: Building2,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Cidades',
      value: new Set(restaurantes.map((r) => r.cidade)).size,
      icon: MapPin,
      color: 'bg-secondary/10 text-secondary',
    },
  ];

  return (
    <div className="space-y-6">
      <CrudPageHeader
        icon={Building2}
        title="Restaurantes"
        description="Gerencie seus restaurantes e operações"
        accent="primary"
        actions={
          <AdminOnly>
            <Button onClick={() => router.push('/restaurantes/novo')}>Novo Restaurante</Button>
          </AdminOnly>
        }
        stats={stats}
      />

      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          {restaurantes.length === 0 && !loading ? (
            <div className="py-20 text-center min-w-full">
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-5">
                <Building2 className="w-10 h-10 text-primary/40" />
              </div>
              <p className="text-text-primary font-medium mb-1">Nenhum restaurante cadastrado</p>
              <p className="text-text-secondary text-sm mb-6">
                Comece adicionando seu primeiro restaurante
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
                    Restaurante
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    CNPJ
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    Localização
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    Horário
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
                {restaurantes.map((restaurante) => (
                  <tr
                    key={restaurante.id}
                    className="hover:bg-primary/5 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <span className="font-semibold text-text-primary">{restaurante.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-secondary">{restaurante.cnpj}</td>
                    <td className="px-4 py-4 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>
                          {restaurante.cidade}, {restaurante.estado}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-secondary">
                      {restaurante.horarioAbertura && restaurante.horarioFechamento
                        ? `${restaurante.horarioAbertura} - ${restaurante.horarioFechamento}`
                        : '-'}
                    </td>
                    <td className="px-4 py-4">
                      <RowActions
                        editLabel={`Editar restaurante ${restaurante.nome}`}
                        deleteLabel={`Excluir restaurante ${restaurante.nome}`}
                        onEdit={() => router.push(`/restaurantes/${restaurante.id}`)}
                        onDelete={() => requestDelete(restaurante.id, restaurante.nome)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {restaurantes.length > 0 && (
          <div className="px-5 py-4 bg-background/50 border-t border-border flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              {restaurantes.length} restaurante{restaurantes.length !== 1 ? 's' : ''} encontrado
              {restaurantes.length !== 1 ? 's' : ''}
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
        title="Excluir restaurante"
        description={
          confirmDelete
            ? `Tem certeza que deseja excluir o restaurante "${confirmDelete.nome}"? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Excluir"
      />
    </div>
  );
}
