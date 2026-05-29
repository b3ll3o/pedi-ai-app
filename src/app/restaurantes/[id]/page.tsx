'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { RestauranteForm } from '@/components/ui/RestauranteForm';
import { api, AtualizarRestauranteDto, Restaurante } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditarRestaurantePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      setLoading(true);
      api.restaurantes.listarUm(id)
        .then(setRestaurante)
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Erro ao carregar restaurante');
        })
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, isLoading, router, id]);

  const handleSubmit = async (data: AtualizarRestauranteDto) => {
    setSubmitting(true);
    setError(null);
    try {
      await api.restaurantes.atualizar(id, data);
      router.push('/restaurantes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar restaurante');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!restaurante) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/restaurantes" className="p-2 hover:bg-surface rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Editar Restaurante</h2>
          </div>
        </div>
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <p className="text-text-secondary">Restaurante não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/restaurantes" className="p-2 hover:bg-surface rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Editar Restaurante</h2>
          <p className="text-sm text-text-secondary">Edite as informações do restaurante</p>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-border p-6">
        <RestauranteForm
          initialData={restaurante}
          onSubmitAtualizar={handleSubmit}
          loading={submitting}
          submitLabel="Salvar Alterações"
        />
      </div>
    </div>
  );
}