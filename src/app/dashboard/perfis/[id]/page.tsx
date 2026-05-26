'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AtualizarPerfilDto, api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { Perfil, Permissao } from '@/lib/api';
import { Shield, Save, X, Plus, Trash2, ArrowLeft } from 'lucide-react';

export default function EditarPerfilPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [todasPermissoes, setTodasPermissoes] = useState<Permissao[]>([]);
  const [associating, setAssociating] = useState(false);
  const [showAssociarModal, setShowAssociarModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<AtualizarPerfilDto>();

  useEffect(() => {
    async function carregar() {
      try {
        const [perfilData, permissoesData] = await Promise.all([
          api.perfis.listarUm(id),
          api.permissoes.listarTodos(),
        ]);
        setPerfil(perfilData);
        setValue('nome', perfilData.nome);
        setValue('descricao', perfilData.descricao || '');
        setTodasPermissoes(permissoesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [id, setValue]);

  const onSubmit = async (data: AtualizarPerfilDto) => {
    try {
      setError(null);
      await api.perfis.atualizar(id, data);
      router.push('/dashboard/perfis');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    }
  };

  const handleDesassociar = async (permissaoId: string) => {
    if (!confirm('Deseja remover esta permissão do perfil?')) return;
    try {
      await api.perfis.desassociarPermissao(id, permissaoId);
      const perfilAtualizado = await api.perfis.listarUm(id);
      setPerfil(perfilAtualizado);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao remover');
    }
  };

  const handleAssociar = async (permissaoId: string) => {
    setAssociating(true);
    try {
      await api.perfis.associarPermissoes(id, [permissaoId]);
      const perfilAtualizado = await api.perfis.listarUm(id);
      setPerfil(perfilAtualizado);
      setShowAssociarModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao associar');
    } finally {
      setAssociating(false);
    }
  };

  const permissoesAssociadas = perfil?.permissoes || [];
  const permissoesNaoAssociadas = todasPermissoes.filter(
    (p) => !permissoesAssociadas.some((pa) => pa.id === p.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          Editar Perfil
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="Nome do Perfil"
            {...register('nome', { required: 'Nome é obrigatório' })}
            error={errors.nome?.message}
          />

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

      <div className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-text-primary">Permissões do Perfil</h3>
          <Button size="sm" onClick={() => setShowAssociarModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Associar
          </Button>
        </div>

        {permissoesAssociadas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-secondary mb-4">Nenhuma permissão associada</p>
            <Button variant="secondary" size="sm" onClick={() => setShowAssociarModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Associar Permissão
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {permissoesAssociadas.map((permissao) => (
              <div
                key={permissao.id}
                className="flex items-center justify-between p-3 bg-background rounded-xl"
              >
                <div>
                  <p className="font-medium text-text-primary">{permissao.nome}</p>
                  <p className="text-xs text-text-secondary font-mono">{permissao.chave}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDesassociar(permissao.id)}
                  className="text-error hover:bg-error/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAssociarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-text-primary">Associar Permissão</h3>
              <button
                onClick={() => setShowAssociarModal(false)}
                className="p-2 hover:bg-background rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {permissoesNaoAssociadas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary">Todas as permissões já estão associadas</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {permissoesNaoAssociadas.map((permissao) => (
                  <button
                    key={permissao.id}
                    onClick={() => handleAssociar(permissao.id)}
                    disabled={associating}
                    className="w-full flex items-center justify-between p-3 bg-background hover:bg-background/70 rounded-xl transition-colors text-left disabled:opacity-50"
                  >
                    <div>
                      <p className="font-medium text-text-primary">{permissao.nome}</p>
                      <p className="text-xs text-text-secondary font-mono">{permissao.chave}</p>
                    </div>
                    <Plus className="w-5 h-5 text-primary" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="ghost" className="w-full" onClick={() => setShowAssociarModal(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
