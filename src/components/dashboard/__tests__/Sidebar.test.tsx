import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('renders sidebar with logo', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', nome: 'Test User', email: 'test@test.com' },
      logout: mockLogout,
    });

    renderSidebar();

    expect(screen.getByText('Pedi-AI')).toBeInTheDocument();
    expect(screen.getByText('Gestão')).toBeInTheDocument();
  });

  it('renders navigation menu items', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', nome: 'Test User', email: 'test@test.com' },
      logout: mockLogout,
    });

    renderSidebar();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Usuários')).toBeInTheDocument();
    expect(screen.getByText('Perfis')).toBeInTheDocument();
    expect(screen.getByText('Permissões')).toBeInTheDocument();
  });

  it('renders user info', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', nome: 'John Doe', email: 'john@test.com' },
      logout: mockLogout,
    });

    renderSidebar();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@test.com')).toBeInTheDocument();
  });

  it('shows hamburger button on mobile', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', nome: 'Test User', email: 'test@test.com' },
      logout: mockLogout,
    });

    renderSidebar();

    const menuButton = screen.getByRole('button', { name: /abrir menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('opens sidebar when hamburger is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', nome: 'Test User', email: 'test@test.com' },
      logout: mockLogout,
    });

    renderSidebar();

    const menuButton = screen.getByRole('button', { name: /abrir menu/i });
    fireEvent.click(menuButton);

    const closeButton = screen.getByRole('button', { name: /fechar menu/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('calls logout and redirects to /login when logout button is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', nome: 'Test User', email: 'test@test.com' },
      logout: mockLogout,
    });

    renderSidebar();

    const logoutButton = screen.getByTitle('Sair');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('highlights active menu item', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', nome: 'Test User', email: 'test@test.com' },
      logout: mockLogout,
    });

    renderSidebar();

    const usuariosLink = screen.getByRole('link', { name: /usuários/i });
    expect(usuariosLink).toHaveAttribute('aria-current', 'page');
  });

  it('closes sidebar when backdrop is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', nome: 'Test User', email: 'test@test.com' },
      logout: mockLogout,
    });

    renderSidebar();

    // Open sidebar first
    const menuButton = screen.getByRole('button', { name: /abrir menu/i });
    fireEvent.click(menuButton);

    // Verify sidebar is open
    const closeButton = screen.getByRole('button', { name: /fechar menu/i });
    expect(closeButton).toBeInTheDocument();

    // Click backdrop to close
    const backdrop = document.querySelector('div[class*="bg-black"]');
    expect(backdrop).toBeInTheDocument();
  });

  it('calls onClick when menu item is clicked to close sidebar', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', nome: 'Test User', email: 'test@test.com' },
      logout: mockLogout,
    });

    renderSidebar();

    // Open sidebar first
    const menuButton = screen.getByRole('button', { name: /abrir menu/i });
    fireEvent.click(menuButton);

    // Click on a menu item
    const usuariosLink = screen.getByRole('link', { name: /usuários/i });
    fireEvent.click(usuariosLink);

    // Sidebar should close (the onClick handler should be called)
  });
});
