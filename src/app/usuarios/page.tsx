import { MainLayout } from '@/components/MainLayout';
import { UsuarioList } from '@/components/ui/UsuarioList';

export default function UsuariosPage() {
  return (
    <MainLayout title="Usuários">
      <UsuarioList />
    </MainLayout>
  );
}