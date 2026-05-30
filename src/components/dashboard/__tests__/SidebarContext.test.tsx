import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { SidebarProvider, useSidebar } from '../SidebarContext';

function TestComponent() {
  const { isOpen, open, close, toggle } = useSidebar();
  return (
    <div>
      <span data-testid="isOpen">{isOpen ? 'true' : 'false'}</span>
      <button onClick={open} data-testid="open">
        Open
      </button>
      <button onClick={close} data-testid="close">
        Close
      </button>
      <button onClick={toggle} data-testid="toggle">
        Toggle
      </button>
    </div>
  );
}

describe('SidebarContext', () => {
  it('provides initial state as closed', () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('isOpen')).toHaveTextContent('false');
  });

  it('opens sidebar when open is called', () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>,
    );

    act(() => {
      screen.getByTestId('open').click();
    });

    expect(screen.getByTestId('isOpen')).toHaveTextContent('true');
  });

  it('closes sidebar when close is called', () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>,
    );

    act(() => {
      screen.getByTestId('open').click();
    });
    expect(screen.getByTestId('isOpen')).toHaveTextContent('true');

    act(() => {
      screen.getByTestId('close').click();
    });
    expect(screen.getByTestId('isOpen')).toHaveTextContent('false');
  });

  it('toggles sidebar when toggle is called', () => {
    render(
      <SidebarProvider>
        <TestComponent />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('isOpen')).toHaveTextContent('false');

    act(() => {
      screen.getByTestId('toggle').click();
    });
    expect(screen.getByTestId('isOpen')).toHaveTextContent('true');

    act(() => {
      screen.getByTestId('toggle').click();
    });
    expect(screen.getByTestId('isOpen')).toHaveTextContent('false');
  });

  it('throws error when useSidebar is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSidebar must be used within a SidebarProvider');
    consoleError.mockRestore();
  });
});
