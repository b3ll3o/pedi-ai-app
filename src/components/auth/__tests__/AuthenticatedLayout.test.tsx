import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthenticatedLayout } from '../AuthenticatedLayout';

const mockPush = jest.fn();
const mockPathname = jest.fn(() => '/dashboard');

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname(),
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/dashboard/Sidebar', () => ({
  Sidebar: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));

import { useAuth } from '@/lib/auth-context';

describe('AuthenticatedLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue('/dashboard');
  });

  it('shows loading spinner when isLoading is true', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    render(
      <AuthenticatedLayout>
        <div>Dashboard Content</div>
      </AuthenticatedLayout>,
    );

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('returns null when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    const { container } = render(
      <AuthenticatedLayout>
        <div>Dashboard Content</div>
      </AuthenticatedLayout>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('redirects to /login when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(
      <AuthenticatedLayout>
        <div>Dashboard Content</div>
      </AuthenticatedLayout>,
    );

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('renders children and sidebar when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        nome: 'Test User',
        email: 'test@test.com',
        perfil: { id: '1', nome: 'ADMIN' },
      },
    });

    render(
      <AuthenticatedLayout>
        <div>Page Content</div>
      </AuthenticatedLayout>,
    );

    expect(screen.getByText('Page Content')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
  });

  it('redirects non-ADMIN when current path is adminOnly', () => {
    mockPathname.mockReturnValue('/dashboard/usuarios');
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        nome: 'Regular User',
        email: 'user@test.com',
        perfil: { id: '2', nome: 'USUARIO' },
      },
    });

    render(
      <AuthenticatedLayout>
        <div>Should not render</div>
      </AuthenticatedLayout>,
    );

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    expect(screen.queryByText('Should not render')).not.toBeInTheDocument();
  });

  it('renders for ADMIN on adminOnly path', () => {
    mockPathname.mockReturnValue('/dashboard/usuarios');
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        nome: 'Admin User',
        email: 'admin@test.com',
        perfil: { id: '1', nome: 'ADMIN' },
      },
    });

    render(
      <AuthenticatedLayout>
        <div>Admin content</div>
      </AuthenticatedLayout>,
    );

    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });
});
