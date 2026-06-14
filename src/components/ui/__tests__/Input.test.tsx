import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveClass('border-error');
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('handles type prop', () => {
    render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
  });

  it('handles disabled prop', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('handles name prop for label association', () => {
    render(<Input name="username" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username');
  });

  it('uses name as id when id not provided', () => {
    render(<Input name="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'email');
  });

  it('uses provided id over name', () => {
    render(<Input name="email" id="custom-id" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'custom-id');
  });

  // --- a11y ---

  it('marca aria-invalid=true quando error é fornecido', () => {
    render(<Input name="email" error="Email inválido" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('não define aria-invalid quando não há erro', () => {
    render(<Input name="email" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('aponta aria-describedby para o id da mensagem de erro', () => {
    render(<Input name="email" error="Email inválido" />);
    const input = screen.getByRole('textbox');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    // O id do erro é derivado do id do input + '-error'
    expect(describedBy).toBe('email-error');
    expect(document.getElementById('email-error')).toHaveTextContent('Email inválido');
  });

  it('renderiza a mensagem de erro com role=alert para screen readers', () => {
    render(<Input name="email" error="Email inválido" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Email inválido');
  });

  it('renderiza hint quando fornecido e sem erro', () => {
    render(<Input name="email" hint="Use seu email corporativo" />);
    expect(screen.getByText('Use seu email corporativo')).toBeInTheDocument();
  });

  it('esconde hint quando há erro (erro tem precedência)', () => {
    render(<Input name="email" hint="Use seu email corporativo" error="Email inválido" />);
    expect(screen.queryByText('Use seu email corporativo')).not.toBeInTheDocument();
    expect(screen.getByText('Email inválido')).toBeInTheDocument();
  });
});
