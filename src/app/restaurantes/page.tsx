'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { api, Restaurante } from '@/lib/api';
import { Building2, MapPin, RefreshCw, Edit2, Trash2 } from 'lucide-react';

export default function RestaurantesPage() {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarRestaurantes = async () => {
    setLoading(true);
    try {
      const dados = await api.restaurantes.listarTodos();
      setRestaurantes(dados);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRestaurantes();
  }, []);

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Deseja excluir o restaurante "${nome}"?`)) return;
    try {
      await api.restaurantes.deletar(id);
      setRestaurantes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Restaurantes</h1>
              <p className="text-text-secondary mt-0.5">Gerencie seus restaurantes e operações</p>
            </div>
          </div>
          <Button onClick={() => (window.location.href = '/restaurantes/novo')}>
            Novo Restaurante
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-3 p-4 bg-background rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {loading ? '-' : restaurantes.length}
              </p>
              <p className="text-sm text-text-secondary">Total</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {loading ? '-' : new Set(restaurantes.map((r) => r.cidade)).size}
              </p>
              <p className="text-sm text-text-secondary">Cidades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Restaurantes */}
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
                    Restaurante
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Localização
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
                      <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => (window.location.href = `/restaurantes/${restaurante.id}`)}
                        >
                          <Edit2 className="w-4 h-4" />
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
            <Button variant="ghost" size="sm" onClick={carregarRestaurantes} loading={loading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
