'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AtualizarUsuarioDto, api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { User, Save, ArrowLeft } from 'lucide-react';

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<AtualizarUsuarioDto>();

  useEffect(() => {
    async function carregar() {
      try {
        const usuario = await api.usuarios.listarUm(id);
        setValue('nome', usuario.nome);
        setValue('email', usuario.email);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [id, setValue]);

  const onSubmit = async (data: AtualizarUsuarioDto) => {
    try {
      setError(null);
      await api.usuarios.atualizar(id, data);
      router.push('/dashboard/usuarios');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="bg-surface rounded-2xl border border-border p-6">
        <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          Editar Usuário
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
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
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email', { required: 'Email é obrigatório' })}
          />

          <Input
            label="Nova Senha"
            type="password"
            placeholder="Deixe em branco para manter a atual"
            error={errors.senha?.message}
            {...register('senha', { minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
          />
          <p className="text-xs text-text-secondary -mt-2">
            Mínimo 6 caracteres. Deixe em branco para manter a senha atual.
          </p>

          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={isSubmitting} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Salvar
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
