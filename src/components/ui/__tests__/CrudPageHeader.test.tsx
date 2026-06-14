import React from 'react';
import { render, screen } from '@testing-library/react';
import { CrudPageHeader } from '../CrudPageHeader';
import { Users, Plus } from 'lucide-react';

describe('CrudPageHeader', () => {
  it('renders title, description and icon', () => {
    render(<CrudPageHeader icon={Users} title="Usuários" description="Gerencie os usuários" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Usuários' })).toBeInTheDocument();
    expect(screen.getByText('Gerencie os usuários')).toBeInTheDocument();
  });

  it('renders actions slot', () => {
    render(
      <CrudPageHeader
        icon={Users}
        title="Usuários"
        description="Gerencie os usuários"
        actions={<button>Novo</button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Novo' })).toBeInTheDocument();
  });

  it('renders stats cards', () => {
    render(
      <CrudPageHeader
        icon={Users}
        title="Usuários"
        description="Gerencie os usuários"
        stats={[
          { label: 'Total', value: 42, icon: Users, color: 'bg-primary/10 text-primary' },
          { label: 'Ativos', value: 30, icon: Plus, color: 'bg-success/10 text-success' },
        ]}
      />,
    );

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Ativos')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('does not render stats section when stats is empty or absent', () => {
    const { container } = render(
      <CrudPageHeader icon={Users} title="Usuários" description="Sem stats" />,
    );

    // Stats containers use grid + border-t; when absent, neither exists
    expect(container.querySelector('.border-t')).not.toBeInTheDocument();
  });
});
