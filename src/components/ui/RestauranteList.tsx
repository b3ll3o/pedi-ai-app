'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, Restaurante } from '@/lib/api';
import { Button } from '@/components/ui';
import { Building2, RefreshCw, Trash2 } from 'lucide-react';

interface RestauranteListProps {
  onEditar?: (restaurante: Restaurante) => void;
  onDeletar?: (id: string) => void;
  loadingExterno?: boolean;
  restaurantesExternos?: Restaurante[];
}

export function RestauranteList({
  onEditar,
  onDeletar,
  loadingExterno,
  restaurantesExternos,
}: RestauranteListProps) {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarRestaurantes = useCallback(async () => {
    if (loadingExterno !== undefined) return;

    setLoading(true);
    setError(null);
    try {
      const dados = await api.restaurantes.listarTodos();
      setRestaurantes(dados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, [loadingExterno]);

  useEffect(() => {
    if (restaurantesExternos !== undefined) {
      setRestaurantes(restaurantesExternos);
    } else {
      carregarRestaurantes();
    }
  }, [restaurantesExternos, carregarRestaurantes]);

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Deseja excluir o restaurante "${nome}"?`)) return;
    try {
      await api.restaurantes.deletar(id);
      setRestaurantes((prev) => prev.filter((r) => r.id !== id));
      onDeletar?.(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const isLoading = loadingExterno !== undefined ? loadingExterno : loading;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="secondary" onClick={carregarRestaurantes} loading={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-error" />
          {error}
        </div>
      )}

      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          {restaurantes.length === 0 && !isLoading ? (
            <div className="py-20 text-center min-w-full">
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-5">
                <Building2 className="w-10 h-10 text-primary/40" />
              </div>
              <p className="text-text-primary font-medium mb-1">Nenhum restaurante cadastrado</p>
              <p className="text-text-secondary text-sm mb-6">
                Comece adicionando seu primeiro restaurante
              </p>
              <Button variant="secondary" onClick={carregarRestaurantes}>
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
                    CNPJ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Cidade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
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
                        <div>
                          <p className="font-semibold text-text-primary">{restaurante.nome}</p>
                          <p className="text-sm text-text-secondary">
                            {restaurante.endereco || 'Endereço não informado'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-text-secondary font-mono bg-background px-3 py-1.5 rounded-lg">
                        {restaurante.cnpj}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-text-primary">
                          {restaurante.cidade}
                        </span>
                        <span className="text-xs text-text-secondary">{restaurante.estado}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-sm text-text-primary font-medium">
                          {restaurante.horarioAbertura} - {restaurante.horarioFechamento}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => onEditar?.(restaurante)}>
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(restaurante.id, restaurante.nome)}
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
        {restaurantes.length > 0 && (
          <div className="px-5 py-4 bg-background/50 border-t border-border flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              {restaurantes.length} restaurante{restaurantes.length !== 1 ? 's' : ''} encontrado
              {restaurantes.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
