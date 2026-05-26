import React from 'react';
import { render, screen } from '@testing-library/react';
import { Table, TableRow } from '../Table';

describe('Table', () => {
  it('renders table element', () => {
    render(
      <Table headers={['Name', 'Email']}>
        <tr><td>Test</td></tr>
      </Table>
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders all headers', () => {
    render(
      <Table headers={['Name', 'Email', 'Role']}>
        <tr><td>John</td><td>john@example.com</td><td>Admin</td></tr>
      </Table>
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <Table headers={['Name']}>
        <tr><td>John Doe</td></tr>
      </Table>
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Table headers={['Name']} className="custom-class">
        <tr><td>Test</td></tr>
      </Table>
    );
    expect(screen.getByRole('table')).toHaveClass('custom-class');
  });
});

describe('TableRow', () => {
  it('renders tr element', () => {
    render(<TableRow><td>Content</td></TableRow>);
    expect(screen.getByRole('row')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(<TableRow><td>Test Content</td></TableRow>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies hover class', () => {
    render(<TableRow><td>Hover</td></TableRow>);
    expect(screen.getByRole('row')).toHaveClass('hover:bg-background/50');
  });

  it('handles onClick prop', () => {
    const handleClick = jest.fn();
    render(
      <TableRow onClick={handleClick}>
        <td>Clickable</td>
      </TableRow>
    );
    expect(screen.getByRole('row')).toHaveClass('cursor-pointer');
  });

  it('applies custom className', () => {
    render(<TableRow className="custom-row"><td>Custom</td></TableRow>);
    expect(screen.getByRole('row')).toHaveClass('custom-row');
  });
});