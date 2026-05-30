'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';

interface AdminOnlyProps {
  children: ReactNode;
}

export function AdminOnly({ children }: AdminOnlyProps) {
  const { user } = useAuth();

  if (user?.perfil?.nome !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}
