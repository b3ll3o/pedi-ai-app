import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RowActions } from '../RowActions';

describe('RowActions', () => {
  it('renders edit and delete buttons with proper aria-labels', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(
      <RowActions
        editLabel="Editar usuário João"
        deleteLabel="Excluir usuário João"
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByRole('button', { name: 'Editar usuário João' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir usuário João' })).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = jest.fn();
    const user = userEvent.setup();

    render(
      <RowActions editLabel="Editar" deleteLabel="Excluir" onEdit={onEdit} onDelete={() => {}} />,
    );

    await user.click(screen.getByRole('button', { name: 'Editar' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = jest.fn();
    const user = userEvent.setup();

    render(
      <RowActions editLabel="Editar" deleteLabel="Excluir" onEdit={() => {}} onDelete={onDelete} />,
    );

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('hides edit button when onEdit is not provided', () => {
    render(<RowActions editLabel="Editar" deleteLabel="Excluir" onDelete={() => {}} />);

    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
  });

  it('hides delete button when onDelete is not provided', () => {
    render(<RowActions editLabel="Editar" deleteLabel="Excluir" onEdit={() => {}} />);

    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument();
  });
});
