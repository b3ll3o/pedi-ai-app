import React from 'react';
import { render, screen } from '@testing-library/react';
import { PublicLayout } from '../PublicLayout';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/lib/auth-context';

describe('PublicLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner when isLoading is true', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    render(
      <PublicLayout>
        <div>Public Content</div>
      </PublicLayout>,
    );

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders children when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <PublicLayout>
        <div>Public Content</div>
      </PublicLayout>,
    );

    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });

  it('returns null when already authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    const { container } = render(
      <PublicLayout>
        <div>Public Content</div>
      </PublicLayout>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('redirects to /dashboard when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <PublicLayout>
        <div>Public Content</div>
      </PublicLayout>,
    );

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});
