import { SidebarProvider } from '@/components/dashboard/SidebarContext';
import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </SidebarProvider>
  );
}
