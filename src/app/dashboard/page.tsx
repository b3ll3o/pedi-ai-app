'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Shield, Key, ArrowRight, RefreshCw, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui';

interface Stats {
  usuarios: number;
  perfis: number;
  permissoes: number;
  restaurantes: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    usuarios: 0,
    perfis: 0,
    permissoes: 0,
    restaurantes: 0,
  });
  const [loading, setLoading] = useState(true);
  // Evita hydration mismatch: o servidor não tem como saber a data local
  // do cliente e `toLocaleDateString` pode divergir (timezone, locale).
  // Renderiza placeholder no SSR e troca para a data real após o mount.
  const [hoje, setHoje] = useState<string>('');

  const carregarStats = useCallback(async () => {
    setLoading(true);
    try {
      const [usuarios, perfis, permissoes, restaurantes] = await Promise.all([
        api.usuarios.listarTodos().catch(() => []),
        api.perfis.listarTodos().catch(() => []),
        api.permissoes.listarTodos().catch(() => []),
        api.restaurantes.listarTodos().catch(() => []),
      ]);
      setStats({
        usuarios: usuarios.length,
        perfis: perfis.length,
        permissoes: permissoes.length,
        restaurantes: restaurantes.length,
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarStats();
    setHoje(new Date().toLocaleDateString('pt-BR'));
  }, [carregarStats]);

  const statCards = [
    {
      label: 'Usuários',
      value: stats.usuarios,
      icon: Users,
      href: '/dashboard/usuarios',
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Perfis',
      value: stats.perfis,
      icon: Shield,
      href: '/dashboard/perfis',
      color: 'bg-secondary/10 text-secondary',
    },
    {
      label: 'Permissões',
      value: stats.permissoes,
      icon: Key,
      href: '/dashboard/permissoes',
      color: 'bg-warning/10 text-warning',
    },
    {
      label: 'Restaurantes',
      value: stats.restaurantes,
      icon: Building2,
      href: '/restaurantes',
      color: 'bg-success/10 text-success',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
              <p className="text-text-secondary mt-0.5">Visão geral do sistema</p>
            </div>
          </div>
          <button
            onClick={carregarStats}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background rounded-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="group bg-background rounded-xl p-5 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">{card.label}</p>
                    <p className="text-3xl font-bold text-text-primary">
                      {loading ? '-' : card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${card.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver {card.label.toLowerCase()}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Acesso Rápido">
          <div className="space-y-2">
            <Link
              href="/dashboard/usuarios/novo"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors"
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-text-primary">Novo Usuário</p>
                <p className="text-sm text-text-secondary">Criar um novo usuário no sistema</p>
              </div>
              <ArrowRight className="w-4 h-4 text-text-secondary" />
            </Link>
            <Link
              href="/dashboard/perfis"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors"
            >
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Shield className="w-4 h-4 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-text-primary">Gerenciar Perfis</p>
                <p className="text-sm text-text-secondary">Editar perfis e permissões</p>
              </div>
              <ArrowRight className="w-4 h-4 text-text-secondary" />
            </Link>
            <Link
              href="/dashboard/permissoes"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors"
            >
              <div className="p-2 bg-warning/10 rounded-lg">
                <Key className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-text-primary">Gerenciar Permissões</p>
                <p className="text-sm text-text-secondary">Configurar permissões do sistema</p>
              </div>
              <ArrowRight className="w-4 h-4 text-text-secondary" />
            </Link>
          </div>
        </Card>

        <Card title="Informações">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-text-secondary">Sistema</span>
              <span className="text-sm font-medium text-text-primary">PediAI Gestão</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-text-secondary">Versão</span>
              <span className="text-sm font-medium text-text-primary">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-text-secondary">Última atualização</span>
              <span className="text-sm font-medium text-text-primary">{hoje || '—'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
