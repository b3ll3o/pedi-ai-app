'use client';

import { render, screen } from '@testing-library/react';
import { AdminOnly } from '../AdminOnly';

const mockUser = {
  id: '1',
  nome: 'Test User',
  email: 'test@test.com',
  perfil: { id: '1', nome: 'ADMIN' },
};

const mockUseAuth = jest.fn();

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('AdminOnly', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar children quando usuario é ADMIN', () => {
    mockUseAuth.mockReturnValue({ user: mockUser });
    render(
      <AdminOnly>
        <span data-testid="children">Conteúdo</span>
      </AdminOnly>,
    );
    expect(screen.getByTestId('children')).toBeInTheDocument();
  });

  it('deve retornar null quando usuario não é ADMIN', () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, perfil: { id: '2', nome: 'USUARIO' } },
    });
    const { container } = render(
      <AdminOnly>
        <span data-testid="children">Conteúdo</span>
      </AdminOnly>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('deve retornar null quando usuario não tem perfil', () => {
    mockUseAuth.mockReturnValue({ user: { ...mockUser, perfil: undefined } });
    const { container } = render(
      <AdminOnly>
        <span data-testid="children">Conteúdo</span>
      </AdminOnly>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('deve retornar null quando não há usuário', () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { container } = render(
      <AdminOnly>
        <span data-testid="children">Conteúdo</span>
      </AdminOnly>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
