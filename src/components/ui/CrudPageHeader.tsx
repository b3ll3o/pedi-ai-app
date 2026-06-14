'use client';

import type { LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

export type CrudAccent = 'primary' | 'secondary' | 'warning' | 'success';

export interface CrudStat {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** Classes Tailwind para bg+text do quadradinho do ícone (ex: 'bg-primary/10 text-primary'). */
  color: string;
}

interface CrudPageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Define a cor do gradiente do header. Default: 'primary'. */
  accent?: CrudAccent;
  /** Slot à direita (ex: botão "Novo ..."). */
  actions?: ReactNode;
  /** Cards de KPI mostrados abaixo do header, separados por border-t. */
  stats?: CrudStat[];
}

const accentMap: Record<CrudAccent, string> = {
  primary: 'from-primary to-primary-dark',
  secondary: 'from-secondary to-secondary-dark',
  warning: 'from-warning to-amber-600',
  success: 'from-success to-emerald-700',
};

/**
 * Header padronizado para páginas de gestão (CRUD).
 *
 * Substitui o bloco "card com gradiente + ícone + título + descrição + (botão) + (stats)"
 * que estava duplicado em `dashboard`, `perfis`, `permissoes` e `restaurantes`.
 *
 * @example
 * ```tsx
 * <CrudPageHeader
 *   icon={Shield}
 *   title="Perfis"
 *   description="Gerencie perfis de acesso"
 *   accent="secondary"
 *   actions={<Button>Novo Perfil</Button>}
 *   stats={[{ label: 'Total', value: perfis.length, icon: Shield, color: 'bg-secondary/10 text-secondary' }]}
 * />
 * ```
 */
export function CrudPageHeader({
  icon: Icon,
  title,
  description,
  accent = 'primary',
  actions,
  stats,
}: CrudPageHeaderProps) {
  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${accentMap[accent]} flex items-center justify-center shadow-md`}
          >
            <Icon className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
            <p className="text-text-secondary mt-0.5">{description}</p>
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
          {stats.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-3 p-4 bg-background rounded-xl"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
                >
                  <StatIcon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-sm text-text-secondary">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
