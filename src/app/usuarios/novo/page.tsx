'use client';

import { useForm } from 'react-hook-form';
import { CriarUsuarioDto, api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CriarUsuarioDto>();

  const onSubmit = async (data: CriarUsuarioDto) => {
    try {
      setError(null);
      await api.usuarios.criar(data);
      router.push('/usuarios');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar');
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-bold text-text-primary mb-6">Novo Usuário</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-error/10 text-error px-4 py-3 rounded-lg">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Nome</label>
          <input
            {...register('nome', { required: 'Nome é obrigatório' })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
          />
          {errors.nome && <p className="text-error text-sm mt-1">{errors.nome.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
          <input
            type="email"
            {...register('email', { required: 'Email é obrigatório' })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
          />
          {errors.email && <p className="text-error text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Senha</label>
          <input
            type="password"
            {...register('senha', { required: 'Senha é obrigatória', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
          />
          {errors.senha && <p className="text-error text-sm mt-1">{errors.senha.message}</p>}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Criar'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-text-primary rounded-lg font-medium hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
