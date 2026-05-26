import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '../page';

jest.mock('@/lib/api', () => ({
  api: {
    usuarios: {
      listarTodos: jest.fn().mockResolvedValue([{ id: '1', nome: 'User 1', email: 'user1@test.com' }]),
    },
    perfis: {
      listarTodos: jest.fn().mockResolvedValue([{ id: '1', nome: 'Admin', descricao: 'Administrador' }]),
    },
    permissoes: {
      listarTodos: jest.fn().mockResolvedValue([{ id: '1', nome: 'Create', chave: 'CREATE' }]),
    },
  },
}));

describe('DashboardPage', () => {
  it('renders dashboard with stats cards', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    });

    expect(screen.getByText('Usuários')).toBeInTheDocument();
    expect(screen.getByText('Perfis')).toBeInTheDocument();
    expect(screen.getByText('Permissões')).toBeInTheDocument();
  });

  it('renders quick access cards', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Acesso Rápido')).toBeInTheDocument();
      expect(screen.getByText('Novo Usuário')).toBeInTheDocument();
      expect(screen.getByText('Gerenciar Perfis')).toBeInTheDocument();
      expect(screen.getByText('Gerenciar Permissões')).toBeInTheDocument();
    });
  });

  it('renders information card', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Informações')).toBeInTheDocument();
      expect(screen.getByText('PediAI Gestão')).toBeInTheDocument();
      expect(screen.getByText('Versão')).toBeInTheDocument();
    });
  });
});
