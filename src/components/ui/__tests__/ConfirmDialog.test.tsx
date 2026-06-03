import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  it('não renderiza quando open é false', () => {
    render(
      <ConfirmDialog
        open={false}
        title="Excluir?"
        description="Sem volta"
        onConfirm={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza título, descrição e labels padrão', () => {
    render(
      <ConfirmDialog
        open
        title="Excluir usuário"
        description="Essa ação não pode ser desfeita"
        onConfirm={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('Excluir usuário')).toBeInTheDocument();
    expect(screen.getByText('Essa ação não pode ser desfeita')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
  });

  it('aceita labels customizados', () => {
    render(
      <ConfirmDialog
        open
        title="T"
        description="d"
        confirmLabel="Sim, excluir"
        cancelLabel="Voltar"
        onConfirm={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Sim, excluir' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
  });

  it('mostra ícone de perigo (AlertTriangle) quando variant é danger (default)', () => {
    const { container } = render(
      <ConfirmDialog open title="T" description="d" onConfirm={() => {}} onClose={() => {}} />,
    );
    expect(container.querySelector('.lucide-triangle-alert')).toBeInTheDocument();
  });

  it('omite ícone de perigo quando variant é primary', () => {
    const { container } = render(
      <ConfirmDialog
        open
        title="T"
        description="d"
        variant="primary"
        onConfirm={() => {}}
        onClose={() => {}}
      />,
    );
    expect(container.querySelector('.lucide-triangle-alert')).not.toBeInTheDocument();
  });

  it('chama onConfirm ao clicar em confirmar', async () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmDialog open title="T" description="d" onConfirm={onConfirm} onClose={() => {}} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('chama onClose ao clicar em cancelar', async () => {
    const onClose = jest.fn();
    render(<ConfirmDialog open title="T" description="d" onConfirm={() => {}} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('desabilita ambos os botões quando loading', () => {
    render(
      <ConfirmDialog
        open
        title="T"
        description="d"
        loading
        onConfirm={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled();
  });

  it('aplica variant danger no botão de confirmar (default)', () => {
    render(
      <ConfirmDialog open title="T" description="d" onConfirm={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveClass('bg-error');
  });

  it('aplica variant primary no botão de confirmar quando variant é primary', () => {
    render(
      <ConfirmDialog
        open
        title="T"
        description="d"
        variant="primary"
        onConfirm={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveClass('bg-primary');
  });
});
