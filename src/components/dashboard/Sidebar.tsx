'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, Shield, Key, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/usuarios', label: 'Usuários', icon: Users },
  { href: '/dashboard/perfis', label: 'Perfis', icon: Shield },
  { href: '/dashboard/permissoes', label: 'Permissões', icon: Key },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile: Fixed bottom navigation bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border safe-area-bottom">
        <div className="flex items-center justify-between px-2">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
                  active
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
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
            {menuItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:bg-secondary-light hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
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
