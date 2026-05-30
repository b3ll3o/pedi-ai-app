import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button, Badge, Card, StatusBadge, Input, Table, TableRow } from '../index';

describe('UI Components Index', () => {
  it('exports Button', () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('exports Badge', () => {
    render(<Badge>Test</Badge>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('exports Card', () => {
    render(<Card>Test</Card>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('exports StatusBadge', () => {
    render(<StatusBadge status="pronto" />);
    expect(screen.getByText('Pronto')).toBeInTheDocument();
  });

  it('exports Input', () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('exports Table', () => {
    render(
      <Table headers={['Col1']}>
        <tr>
          <td>Data</td>
        </tr>
      </Table>,
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('exports TableRow', () => {
    render(
      <table>
        <tbody>
          <TableRow>
            <td>Row Data</td>
          </TableRow>
        </tbody>
      </table>,
    );
    expect(screen.getByRole('row')).toBeInTheDocument();
  });
});
