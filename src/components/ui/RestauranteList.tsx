'use client';

import { useState, useEffect } from 'react';
import { api, Restaurante } from '@/lib/api';
import { Button } from '@/components/ui';
import { Building2, RefreshCw, Trash2 } from 'lucide-react';

interface RestauranteListProps {
  onEditar?: (restaurante: Restaurante) => void;
  onDeletar?: (id: string) => void;
  loadingExterno?: boolean;
  restaurantesExternos?: Restaurante[];
}

export function RestauranteList({ onEditar, onDeletar, loadingExterno, restaurantesExternos }: RestauranteListProps) {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarRestaurantes = async () => {
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
  };

  useEffect(() => {
    if (restaurantesExternos !== undefined) {
      setRestaurantes(restaurantesExternos);
    } else {
      carregarRestaurantes();
    }
  }, [restaurantesExternos]);

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <Button variant="secondary" onClick={carregarRestaurantes} loading={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Carregar
        </Button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          {restaurantes.length === 0 && !isLoading ? (
            <div className="py-16 text-center min-w-full">
              <Building2 className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
              <p className="text-text-secondary mb-4">Nenhum restaurante encontrado</p>
              <Button variant="secondary" onClick={carregarRestaurantes}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Carregar Restaurantes
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-background/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">CNPJ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Cidade</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Horário</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {restaurantes.map((restaurante) => (
                  <tr key={restaurante.id} className="hover:bg-background/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-text-primary">{restaurante.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-secondary font-mono">{restaurante.cnpj}</td>
                    <td className="px-4 py-4 text-sm text-text-secondary">{restaurante.cidade}</td>
                    <td className="px-4 py-4 text-sm text-text-secondary">{restaurante.estado}</td>
                    <td className="px-4 py-4 text-sm text-text-secondary">
                      {restaurante.horarioAbertura} - {restaurante.horarioFechamento}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
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
      </div>
    </div>
  );
}