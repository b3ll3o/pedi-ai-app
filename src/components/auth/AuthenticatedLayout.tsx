'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { isAdminOnlyPath, ADMIN_HOME } from '@/lib/page-meta';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

/**
 * Layout estrutural para todas as rotas autenticadas. Faz a checagem de
 * auth (camada cliente, complementar ao `proxy.ts` server-side) e envolve
 * o conteúdo com `<Sidebar>` + `<main>`.
 *
 * O título/breadcrumb é responsabilidade da **página** (via
 * `<CrudPageHeader>`), não do layout — isso permite títulos dinâmicos
 * (ex: edição com nome do item) e mantém cada página auto-contida.
 *
 * Camadas de proteção:
 * 1. `proxy.ts` (server-side) — redireciona sem cookie httpOnly
 * 2. Este layout — redireciona se o contexto cliente não estiver autenticado
 *    ou se a página é admin-only e o user não é ADMIN
 * 3. `<AdminOnly>` da Sidebar — esconde menu (apenas cosmético)
 */
export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const adminOnly = isAdminOnlyPath(pathname);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (adminOnly && user?.perfil?.nome !== 'ADMIN') {
      router.push(ADMIN_HOME);
    }
  }, [isLoading, isAuthenticated, adminOnly, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
          role="status"
          aria-label="Carregando"
        />
      </div>
    );
  }

  if (!user || (adminOnly && user.perfil?.nome !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <main className="flex-1 p-4 sm:p-6 pb-20 lg:pb-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
