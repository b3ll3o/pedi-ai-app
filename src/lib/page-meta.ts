import { LayoutDashboard, type LucideIcon } from 'lucide-react';

export interface PageMeta {
  title: string;
  breadcrumb: string;
  icon: LucideIcon;
  adminOnly: boolean;
}

/**
 * Mapa path-prefixo → metadata da página. Usado por `AuthenticatedLayout`
 * para resolver a flag `adminOnly` a partir do pathname, e pelas páginas
 * (via `getPageMeta`) para resolver título/breadcrumb/ícone.
 *
 * Prefixos mais específicos devem vir antes dos genéricos
 * (ex: `/dashboard/usuarios` antes de `/dashboard`).
 */
export const PAGE_META: Array<[string, PageMeta]> = [
  [
    '/dashboard/usuarios',
    {
      title: 'Usuários',
      breadcrumb: 'Gestão / Usuários',
      icon: LayoutDashboard,
      adminOnly: true,
    },
  ],
  [
    '/dashboard/perfis',
    {
      title: 'Perfis',
      breadcrumb: 'Gestão / Perfis',
      icon: LayoutDashboard,
      adminOnly: true,
    },
  ],
  [
    '/dashboard/permissoes',
    {
      title: 'Permissões',
      breadcrumb: 'Gestão / Permissões',
      icon: LayoutDashboard,
      adminOnly: true,
    },
  ],
  [
    '/restaurantes',
    {
      title: 'Restaurantes',
      breadcrumb: 'Restaurantes',
      icon: LayoutDashboard,
      adminOnly: false,
    },
  ],
  [
    '/dashboard',
    {
      title: 'Dashboard',
      breadcrumb: 'Dashboard',
      icon: LayoutDashboard,
      adminOnly: false,
    },
  ],
];

export const ADMIN_HOME = '/dashboard';

const DEFAULT_META: PageMeta = {
  title: 'Dashboard',
  breadcrumb: 'Dashboard',
  icon: LayoutDashboard,
  adminOnly: false,
};

/**
 * Resolve a metadata (título, breadcrumb, ícone, adminOnly) a partir do
 * pathname. Retorna a default se nenhum prefixo bater.
 */
export function getPageMeta(pathname: string): PageMeta {
  for (const [prefix, meta] of PAGE_META) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return meta;
    }
  }
  return DEFAULT_META;
}

export function isAdminOnlyPath(pathname: string): boolean {
  for (const [prefix, meta] of PAGE_META) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return meta.adminOnly;
    }
  }
  return false;
}
