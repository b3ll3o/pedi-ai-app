'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { SidebarProvider } from './SidebarContext';
import { LayoutDashboard } from 'lucide-react';

const pageTitles: Record<string, { title: string; breadcrumb: string }> = {
  '/dashboard/usuarios': { title: 'Usuários', breadcrumb: 'Gestão / Usuários' },
  '/dashboard/perfis': { title: 'Perfis', breadcrumb: 'Gestão / Perfis' },
  '/dashboard/permissoes': { title: 'Permissões', breadcrumb: 'Gestão / Permissões' },
};

function getPageInfo(pathname: string) {
  if (pathname.startsWith('/dashboard/usuarios')) {
    return pageTitles['/dashboard/usuarios'];
  }
  if (pathname.startsWith('/dashboard/perfis')) {
    return pageTitles['/dashboard/perfis'];
  }
  if (pathname.startsWith('/dashboard/permissoes')) {
    return pageTitles['/dashboard/permissoes'];
  }
  return { title: 'Dashboard', breadcrumb: 'Dashboard' };
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const { title, breadcrumb } = getPageInfo(pathname);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <header className="bg-surface border-b border-border px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
              <LayoutDashboard className="w-4 h-4" />
              <span>{breadcrumb}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">{title}</h1>
          </header>
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
