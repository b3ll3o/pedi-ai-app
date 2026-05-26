'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AtualizarPermissaoDto, api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { MainLayout } from '@/components/MainLayout';
import { Key, Save, ArrowLeft } from 'lucide-react';

export default function EditarPermissaoPage() {
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
  } = useForm<AtualizarPermissaoDto>();

  useEffect(() => {
    async function carregar() {
      try {
        const permissao = await api.permissoes.listarUm(id);
        setValue('nome', permissao.nome);
        setValue('chave', permissao.chave);
        setValue('descricao', permissao.descricao || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [id, setValue]);

  const onSubmit = async (data: AtualizarPermissaoDto) => {
    try {
      setError(null);
      await api.permissoes.atualizar(id, data);
      router.push('/permissoes');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    }
  };

  const handleChaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    setValue('chave', value);
  };

  if (loading) {
    return (
      <MainLayout title="Editar Permissão">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Editar Permissão">
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
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-secondary" />
            </div>
            Editar Permissão
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Nome da Permissão"
              {...register('nome', { required: 'Nome é obrigatório' })}
              error={errors.nome?.message}
            />

            <Input
              label="Chave"
              {...register('chave', { required: 'Chave é obrigatória' })}
              error={errors.chave?.message}
              placeholder="CHAVE_UNICA"
              onChange={handleChaveChange}
            />
            <p className="text-xs text-text-secondary -mt-2">
              A chave é usada internamente. Use CAIXA_ALTA_COM_UNDERSCORE
            </p>

            <Input
              label="Descrição"
              {...register('descricao')}
              placeholder="Descrição opcional"
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
