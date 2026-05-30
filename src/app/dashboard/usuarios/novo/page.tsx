'use client';

import { useForm } from 'react-hook-form';
import { CriarUsuarioDto, api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { User, ArrowLeft } from 'lucide-react';

export default function NovoUsuarioDashboardPage() {
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
      router.push('/dashboard/usuarios');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário');
    }
  };

  return (
    <div className="max-w-md">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
        <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          Novo Usuário
        </h2>

        <p className="text-text-secondary mb-6 text-sm">Cadastre um novo usuário no sistema.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="Nome Completo"
            placeholder="Digite o nome"
            error={errors.nome?.message}
            {...register('nome', { required: 'Nome é obrigatório' })}
          />

          <Input
            label="Email"
            type="email"
            placeholder="email@exemplo.com"
            error={errors.email?.message}
            {...register('email', { required: 'Email é obrigatório' })}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            error={errors.senha?.message}
            {...register('senha', {
              required: 'Senha é obrigatória',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            })}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={isSubmitting} className="flex-1">
              Criar Usuário
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
