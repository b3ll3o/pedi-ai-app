import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../auth-context';

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const DummyChild = () => {
    const { user, accessToken, isLoading, isAuthenticated, login, logout } = useAuth();
    return (
      <div>
        <span data-testid="is-loading">{isLoading.toString()}</span>
        <span data-testid="is-authenticated">{isAuthenticated.toString()}</span>
        <span data-testid="user">{user?.email || 'null'}</span>
        <span data-testid="token">{accessToken || 'null'}</span>
        <button onClick={() => { login('test@test.com', 'password'); }}>Login</button>
        <button onClick={() => { logout(); }}>Logout</button>
      </div>
    );
  };

  it('initial loading state is set', () => {
    render(
      <AuthProvider>
        <DummyChild />
      </AuthProvider>
    );
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('initializes with no user when no stored token', async () => {
    render(
      <AuthProvider>
        <DummyChild />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  it('initializes with stored user when token exists', async () => {
    const storedUser = { id: '1', nome: 'Test', email: 'test@test.com' };
    localStorage.setItem('pedi_auth_access_token', 'fake-token');
    localStorage.setItem('pedi_auth_user', JSON.stringify(storedUser));

    render(
      <AuthProvider>
        <DummyChild />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
    expect(screen.getByTestId('token')).toHaveTextContent('fake-token');
  });

  it('login successful creates tokens and fetches user', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: 'new-token', refreshToken: 'refresh-token', expiresIn: 900, tokenType: 'Bearer' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', nome: 'Test', email: 'test@test.com' }),
      });

    render(
      <AuthProvider>
        <DummyChild />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    act(() => {
      fireEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
    expect(localStorage.getItem('pedi_auth_access_token')).toBe('new-token');
    expect(localStorage.getItem('pedi_auth_refresh_token')).toBe('refresh-token');
  });

  it('login failed keeps user unauthenticated', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Credenciais inválidas' }),
    });

    render(
      <AuthProvider>
        <DummyChild />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    act(() => {
      fireEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    });
  });

  it('logout clears state and storage', async () => {
    const storedUser = { id: '1', nome: 'Test', email: 'test@test.com' };
    localStorage.setItem('pedi_auth_access_token', 'fake-token');
    localStorage.setItem('pedi_auth_refresh_token', 'refresh-token');
    localStorage.setItem('pedi_auth_user', JSON.stringify(storedUser));

    mockFetch.mockResolvedValueOnce({ ok: true });

    render(
      <AuthProvider>
        <DummyChild />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    act(() => {
      fireEvent.click(screen.getByText('Logout'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    });
    expect(localStorage.getItem('pedi_auth_access_token')).toBeNull();
    expect(localStorage.getItem('pedi_auth_refresh_token')).toBeNull();
    expect(localStorage.getItem('pedi_auth_user')).toBeNull();
  });

  it('logout handles fetch error gracefully', async () => {
    const storedUser = { id: '1', nome: 'Test', email: 'test@test.com' };
    localStorage.setItem('pedi_auth_access_token', 'fake-token');
    localStorage.setItem('pedi_auth_user', JSON.stringify(storedUser));

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <AuthProvider>
        <DummyChild />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    act(() => {
      fireEvent.click(screen.getByText('Logout'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    });
  });
});
