import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('não renderiza nada quando open é false', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Título">
        <p>conteúdo</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza título e conteúdo quando open é true', () => {
    render(
      <Modal open onClose={() => {}} title="Confirmar exclusão">
        <p>Tem certeza?</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirmar exclusão')).toBeInTheDocument();
    expect(screen.getByText('Tem certeza?')).toBeInTheDocument();
  });

  it('usa aria-labelledby apontando para o título', () => {
    render(
      <Modal open onClose={() => {}} title="Meu título" titleId="custom-id">
        <p>x</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'custom-id');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('deriva id do título quando titleId não é fornecido', () => {
    render(
      <Modal open onClose={() => {}} title="Meu Título Novo">
        <p>x</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)).toHaveTextContent('Meu Título Novo');
  });

  it('fecha ao clicar no botão X', async () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} title="X">
        <p>x</p>
      </Modal>,
    );
    await userEvent.click(screen.getByRole('button', { name: /fechar modal/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fecha ao clicar no backdrop', async () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} title="X">
        <p>x</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog.parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('não fecha ao clicar dentro do diálogo (stopPropagation)', async () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} title="X">
        <p>conteúdo</p>
      </Modal>,
    );
    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('fecha ao pressionar ESC', () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} title="X">
        <p>x</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('não responde a outras teclas', () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} title="X">
        <p>x</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('move foco para o primeiro focável dentro do modal ao abrir', () => {
    render(
      <Modal open onClose={() => {}} title="X">
        <button type="button">primeiro</button>
        <button type="button">segundo</button>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    // O primeiro focável do modal é o botão X (Fechar) que vem antes do children.
    // O importante é que o foco foi movido para DENTRO do modal, não para <body>.
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('trava o scroll do body enquanto aberto e restaura ao fechar', () => {
    const { rerender } = render(
      <Modal open onClose={() => {}} title="X">
        <p>x</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal open={false} onClose={() => {}} title="X">
        <p>x</p>
      </Modal>,
    );
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('aplica largura de acordo com size sm', () => {
    render(
      <Modal open onClose={() => {}} title="X" size="sm">
        <p>x</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('max-w-sm');
  });

  it('aplica largura de acordo com size lg', () => {
    render(
      <Modal open onClose={() => {}} title="X" size="lg">
        <p>x</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('max-w-lg');
  });

  it('aplica largura de acordo com size xl', () => {
    render(
      <Modal open onClose={() => {}} title="X" size="xl">
        <p>x</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('max-w-2xl');
  });

  it('usa max-w-md como default', () => {
    render(
      <Modal open onClose={() => {}} title="X">
        <p>x</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toHaveClass('max-w-md');
  });
});
