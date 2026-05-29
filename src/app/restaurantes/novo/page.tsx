'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { RestauranteForm } from '@/components/ui/RestauranteForm';
import { api, CriarRestauranteDto } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NovoRestaurantePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (data: CriarRestauranteDto) => {
    setLoading(true);
    setError(null);
    try {
      await api.restaurantes.criar(data);
      router.push('/restaurantes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar restaurante');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/restaurantes"
          className="p-2 hover:bg-surface rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Novo Restaurante</h2>
          <p className="text-sm text-text-secondary">Crie um novo restaurante</p>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-border p-6">
        <RestauranteForm onSubmitCriar={handleSubmit} loading={loading} submitLabel="Criar Restaurante" />
      </div>
    </div>
  );
}