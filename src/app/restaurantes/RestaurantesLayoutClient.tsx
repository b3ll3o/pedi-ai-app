'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SidebarProvider } from '@/components/dashboard/SidebarContext';
import { Building2 } from 'lucide-react';

interface RestaurantesLayoutProps {
  children: React.ReactNode;
}

export function RestaurantesLayout({ children }: RestaurantesLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

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

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <header className="bg-surface border-b border-border px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
              <Building2 className="w-4 h-4" />
              <span>Restaurantes</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Restaurantes</h1>
          </header>
          <main className="flex-1 p-4 sm:p-6 pb-20 lg:pb-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
