'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Users, Shield, Key, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const menuItems = [
  { href: '/dashboard/usuarios', label: 'Usuários', icon: Users },
  { href: '/dashboard/perfis', label: 'Perfis', icon: Shield },
  { href: '/dashboard/permissoes', label: 'Permissões', icon: Key },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-secondary text-white rounded-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-secondary text-white flex flex-col transform transition-transform lg:static lg:translate-x-0 lg:h-auto lg:min-h-0 lg:w-64 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${open ? 'h-screen' : 'h-auto'}`}
      >
        <div className="flex-none p-4 border-b border-secondary-light flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Pedi-AI</h1>
            <p className="text-sm text-gray-400">Gestão</p>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
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
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-secondary-light hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
                <span className="font-medium">Sair</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="flex-none p-4 border-t border-secondary-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
              {user?.nome?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.nome || 'Usuário'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
