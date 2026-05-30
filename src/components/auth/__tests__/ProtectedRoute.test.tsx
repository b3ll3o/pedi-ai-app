import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../ProtectedRoute';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/lib/auth-context';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner when isLoading is true', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('returns null when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to custom path when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <ProtectedRoute redirectTo="/custom-login">
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(mockPush).toHaveBeenCalledWith('/custom-login');
  });

  it('redirects to /dashboard when authenticated but wrong role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', nome: 'Test', perfil: { id: '2', nome: 'USUARIO' } },
    });

    render(
      <ProtectedRoute requiredRole="ADMIN">
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('renders children when authenticated with correct role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', nome: 'Test', perfil: { id: '1', nome: 'ADMIN' } },
    });

    render(
      <ProtectedRoute requiredRole="ADMIN">
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when no requiredRole is specified', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', nome: 'Test', perfil: { id: '2', nome: 'USUARIO' } },
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
