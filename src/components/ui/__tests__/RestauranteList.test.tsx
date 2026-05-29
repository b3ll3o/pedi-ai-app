import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RestauranteList } from '../RestauranteList';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    restaurantes: {
      listarTodos: jest.fn(),
      deletar: jest.fn(),
    },
  },
}));

const mockRestaurantes = [
  {
    id: '1',
    nome: 'Restaurante A',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua A',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '12345-678',
    horarioAbertura: '09:00',
    horarioFechamento: '18:00',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null,
    version: 1,
  },
];

describe('RestauranteList', () => {
  const mockEditar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (api.restaurantes.listarTodos as jest.Mock).mockResolvedValue(mockRestaurantes);
    (api.restaurantes.deletar as jest.Mock).mockResolvedValue(undefined);
  });

  describe('rendering', () => {
    it('renders the list with restaurants', async () => {
      render(<RestauranteList />);

      await waitFor(() => {
        expect(screen.getByText('Restaurante A')).toBeInTheDocument();
      });
    });

    it('renders table headers', () => {
      render(<RestauranteList />);

      expect(screen.getByText(/nome/i)).toBeInTheDocument();
      expect(screen.getByText(/cnpj/i)).toBeInTheDocument();
      expect(screen.getByText(/cidade/i)).toBeInTheDocument();
      expect(screen.getByText(/estado/i)).toBeInTheDocument();
      expect(screen.getByText(/horário/i)).toBeInTheDocument();
      expect(screen.getByText(/ações/i)).toBeInTheDocument();
    });

    it('displays restaurant CNPJ', async () => {
      render(<RestauranteList />);

      await waitFor(() => {
        expect(screen.getByText('12.345.678/0001-90')).toBeInTheDocument();
      });
    });

    it('displays restaurant city and state', async () => {
      render(<RestauranteList />);

      await waitFor(() => {
        expect(screen.getByText('São Paulo')).toBeInTheDocument();
      });
    });

    it('displays restaurant hours', async () => {
      render(<RestauranteList />);

      await waitFor(() => {
        expect(screen.getByText('09:00 - 18:00')).toBeInTheDocument();
      });
    });
  });

  describe('external data', () => {
    it('uses external restaurantes when provided', () => {
      const externalRestaurantes = [mockRestaurantes[0]];
      render(<RestauranteList restaurantesExternos={externalRestaurantes} />);

      expect(screen.getByText('Restaurante A')).toBeInTheDocument();
    });

    it('does not call api when external data is provided', () => {
      render(<RestauranteList restaurantesExternos={mockRestaurantes} />);

      expect(api.restaurantes.listarTodos).not.toHaveBeenCalled();
    });
  });

  describe('actions', () => {
    it('calls onEditar when edit button is clicked', async () => {
      render(<RestauranteList onEditar={mockEditar} />);

      await waitFor(() => {
        expect(screen.getByText('Restaurante A')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /editar/i });
      await userEvent.click(editButton);

      expect(mockEditar).toHaveBeenCalledWith(mockRestaurantes[0]);
    });
  });
});
