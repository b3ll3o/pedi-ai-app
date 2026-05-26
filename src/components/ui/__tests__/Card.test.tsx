import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Card title="My Card Title">Content</Card>);
    expect(screen.getByText('My Card Title')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    const { container } = render(<Card>Content only</Card>);
    expect(container.querySelector('h3')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Custom</Card>);
    const card = screen.getByText('Custom').closest('[class*="rounded"]');
    expect(card).toHaveClass('custom-class');
  });

  it('has overflow-hidden for border-radius', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content').closest('[class*="overflow"]');
    expect(card).toHaveClass('overflow-hidden');
  });
});