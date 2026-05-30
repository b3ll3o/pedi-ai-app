'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Users, Shield, Key, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from './dashboard/SidebarContext';
import { AdminOnly } from './auth/AdminOnly';

const menuItems = [
  { href: '/dashboard/usuarios', label: 'Usuários', icon: Users },
  { href: '/dashboard/perfis', label: 'Perfis', icon: Shield },
  { href: '/dashboard/permissoes', label: 'Permissões', icon: Key },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isOpen, open, close } = useSidebar();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <button
        onClick={open}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-secondary text-white rounded-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={close} />}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 h-screen bg-secondary text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:w-64 lg:min-h-screen lg:flex lg:flex-col lg:shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex-none h-16 px-4 flex items-center justify-between border-b border-secondary-light">
          <div>
            <h1 className="text-xl font-bold">Pedi-AI</h1>
            <p className="text-sm text-gray-400">Gestão</p>
          </div>
          <button onClick={close} className="lg:hidden text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            <AdminOnly>
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
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
            </AdminOnly>
          </ul>
        </nav>

        <div className="mt-auto flex-none border-t border-secondary-light">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-4 text-gray-300 hover:bg-secondary-light hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">Sair</span>
          </button>
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary-light/50">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user?.nome || 'Usuário'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
