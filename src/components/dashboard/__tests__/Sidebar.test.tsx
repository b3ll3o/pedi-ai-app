import React from 'react';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../Sidebar';

const mockPush = jest.fn();
const mockRouter = { push: mockPush };

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: jest.fn(() => '/dashboard/usuarios'),
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn(),
}));

const mockLogout = jest.fn();

import { useAuth } from '@/lib/auth-context';

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderSidebar = () => {
    return render(<Sidebar />);
  };

  it('renders sidebar with logo on desktop', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '1',
        nome: 'Test User',
        email: 'test@test.com',
        perfil: { id: '1', nome: 'ADMIN' },
      },
      logout: mockLogout,
    });

    renderSidebar();

    expect(screen.getByText('Pedi-AI')).toBeInTheDocument();
    expect(screen.getByText('Gestão')).toBeInTheDocument();
  });

  it('renders navigation menu items', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '1',
        nome: 'Test User',
        email: 'test@test.com',
        perfil: { id: '1', nome: 'ADMIN' },
      },
      logout: mockLogout,
    });

    renderSidebar();

    // Menu items appear in both mobile bottom nav and desktop sidebar
    const usuariosItems = screen.getAllByText('Usuários');
    expect(usuariosItems.length).toBeGreaterThan(0);
    const perfisItems = screen.getAllByText('Perfis');
    expect(perfisItems.length).toBeGreaterThan(0);
    const permissoesItems = screen.getAllByText('Permissões');
    expect(permissoesItems.length).toBeGreaterThan(0);
  });

  it('renders user info', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '1',
        nome: 'John Doe',
        email: 'john@test.com',
        perfil: { id: '1', nome: 'ADMIN' },
      },
      logout: mockLogout,
    });

    renderSidebar();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@test.com')).toBeInTheDocument();
  });

  it('calls logout and redirects to /login when logout button is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '1',
        nome: 'Test User',
        email: 'test@test.com',
        perfil: { id: '1', nome: 'ADMIN' },
      },
      logout: mockLogout,
    });

    renderSidebar();

    const logoutButtons = screen.getAllByTitle('Sair');
    logoutButtons[0].click();

    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('highlights active menu item', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '1',
        nome: 'Test User',
        email: 'test@test.com',
        perfil: { id: '1', nome: 'ADMIN' },
      },
      logout: mockLogout,
    });

    renderSidebar();

    const usuariosLinks = screen.getAllByRole('link', { name: /usuários/i });
    const activeLink = usuariosLinks.find((link) => link.getAttribute('aria-current') === 'page');
    expect(activeLink).toBeInTheDocument();
  });
});
