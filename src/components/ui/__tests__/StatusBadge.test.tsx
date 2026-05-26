import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders confirmado status', () => {
    render(<StatusBadge status="confirmado" />);
    const badge = screen.getByText('Confirmado');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-warning/10', 'text-warning');
  });

  it('renders em_preparo status', () => {
    render(<StatusBadge status="em_preparo" />);
    const badge = screen.getByText('Em Preparo');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-primary/10', 'text-primary');
  });

  it('renders pronto status', () => {
    render(<StatusBadge status="pronto" />);
    const badge = screen.getByText('Pronto');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-success/10', 'text-success');
  });

  it('renders entregue status', () => {
    render(<StatusBadge status="entregue" />);
    const badge = screen.getByText('Entregue');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-success/10', 'text-success');
  });

  it('renders fechado status', () => {
    render(<StatusBadge status="fechado" />);
    const badge = screen.getByText('Fechado');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-background', 'text-text-secondary', 'border');
  });

  it('renders cancelado status', () => {
    render(<StatusBadge status="cancelado" />);
    const badge = screen.getByText('Cancelado');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-error/10', 'text-error');
  });

  it('renders unknown status as-is', () => {
    render(<StatusBadge status="custom_status" />);
    const badge = screen.getByText('custom_status');
    expect(badge).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<StatusBadge status="pronto" className="ml-2" />);
    const badge = screen.getByText('Pronto');
    expect(badge).toHaveClass('ml-2');
  });
});