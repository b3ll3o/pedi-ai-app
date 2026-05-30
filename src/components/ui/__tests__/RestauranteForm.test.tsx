import React from 'react';
import { render, screen } from '@testing-library/react';
import { RestauranteForm } from '../RestauranteForm';

describe('RestauranteForm', () => {
  const mockCriar = jest.fn();
  const mockAtualizar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all form fields', () => {
      render(<RestauranteForm onSubmitCriar={mockCriar} />);

      // 6 text inputs + 2 time inputs = 8 total
      expect(screen.getAllByRole('textbox')).toHaveLength(6);
      // Check that time inputs exist by looking for type="time" inputs
      const timeInputs = document.querySelectorAll('input[type="time"]');
      expect(timeInputs).toHaveLength(2);
    });

    it('renders submit button with default label for create', () => {
      render(<RestauranteForm onSubmitCriar={mockCriar} />);
      expect(screen.getByRole('button', { name: /criar restaurante/i })).toBeInTheDocument();
    });

    it('renders submit button with custom label', () => {
      render(<RestauranteForm onSubmitCriar={mockCriar} submitLabel="Custom Label" />);
      expect(screen.getByRole('button', { name: /custom label/i })).toBeInTheDocument();
    });

    it('renders submit button with update label when initialData provided', () => {
      render(
        <RestauranteForm
          onSubmitAtualizar={mockAtualizar}
          initialData={{
            id: '1',
            nome: 'Test',
            cnpj: '12.345.678/0001-90',
            endereco: 'Rua Test',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '12345-678',
            horarioAbertura: '09:00',
            horarioFechamento: '18:00',
          }}
        />,
      );
      expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('disables submit button when loading', () => {
      render(<RestauranteForm onSubmitCriar={mockCriar} loading={true} />);
      expect(screen.getByRole('button', { name: /criar restaurante/i })).toBeDisabled();
    });
  });

  describe('initialData', () => {
    it('pre-fills form when initialData is provided', () => {
      render(
        <RestauranteForm
          onSubmitAtualizar={mockAtualizar}
          initialData={{
            id: '1',
            nome: 'Restaurante Teste',
            cnpj: '12.345.678/0001-90',
            endereco: 'Rua Test',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '12345-678',
            horarioAbertura: '09:00',
            horarioFechamento: '18:00',
          }}
        />,
      );

      expect(screen.getByRole('textbox', { name: /nome do restaurante/i })).toHaveValue(
        'Restaurante Teste',
      );
      expect(screen.getByRole('textbox', { name: /cnpj/i })).toHaveValue('12.345.678/0001-90');
      expect(screen.getByRole('textbox', { name: /endereço/i })).toHaveValue('Rua Test');
      expect(screen.getByRole('textbox', { name: /cidade/i })).toHaveValue('São Paulo');
      expect(screen.getByRole('textbox', { name: /estado/i })).toHaveValue('SP');
      expect(screen.getByRole('textbox', { name: /cep/i })).toHaveValue('12345-678');
    });
  });
});
