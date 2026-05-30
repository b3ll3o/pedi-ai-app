'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, Shield, Key, Building2, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AdminOnly } from '@/components/auth/AdminOnly';

const menuItemsBase = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/restaurantes', label: 'Restaurantes', icon: Building2 },
];

const adminMenuItems = [
  { href: '/dashboard/usuarios', label: 'Usuários', icon: Users },
  { href: '/dashboard/perfis', label: 'Perfis', icon: Shield },
  { href: '/dashboard/permissoes', label: 'Permissões', icon: Key },
];

interface MenuItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | undefined }>;
}

function MenuItem({ href, label, icon: Icon }: MenuItemProps) {
  const pathname = usePathname();
  const isActive = href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <li>
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-primary hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5" aria-hidden={true} />
        <span className="font-medium">{label}</span>
      </Link>
    </li>
  );
}

function MobileNavItem({ href, label, icon: Icon }: MenuItemProps) {
  const pathname = usePathname();
  const isActive = href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
        isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      <Icon className="w-5 h-5" aria-hidden={true} />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile: Fixed bottom navigation bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border safe-area-bottom">
        <div className="flex items-center justify-between px-2">
          {menuItemsBase.map((item) => (
            <MobileNavItem key={item.href} {...item} />
          ))}
          <AdminOnly>
            {adminMenuItems.map((item) => (
              <MobileNavItem key={item.href} {...item} />
            ))}
          </AdminOnly>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-text-secondary hover:text-error transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs font-medium">Sair</span>
          </button>
        </div>
      </nav>

      {/* Desktop: Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-secondary lg:text-white lg:fixed lg:inset-y-0 lg:left-0">
        <div className="p-4 border-b border-secondary-light flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Pedi-AI</h1>
            <p className="text-sm text-gray-400">Gestão</p>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItemsBase.map((item) => (
              <MenuItem key={item.href} {...item} />
            ))}
            <AdminOnly>
              {adminMenuItems.map((item) => (
                <MenuItem key={item.href} {...item} />
              ))}
            </AdminOnly>
          </ul>
        </nav>

        <div className="p-4 border-t border-secondary-light">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium text-sm">{user?.nome || 'Usuário'}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-secondary-light rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
