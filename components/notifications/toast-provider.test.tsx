import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from './toast-provider';

function TestComponent() {
  const { toast, dismissAll } = useToast();
  return (
    <div>
      <button onClick={() => toast({ title: 'Test toast' })}>Show Toast</button>
      <button onClick={() => toast({ title: 'Error', variant: 'destructive' })}>Show Error</button>
      <button onClick={() => toast({ title: 'With Action', action: { label: 'Undo', onClick: vi.fn() } })}>
        With Action
      </button>
      <button onClick={dismissAll}>Dismiss All</button>
    </div>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('shows toast notification', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Test toast')).toBeInTheDocument();
  });

  test('shows destructive toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Error'));
    const toastElement = screen.getByText('Error').closest('[data-variant]');
    expect(toastElement).toBeInTheDocument();
    expect(toastElement).toHaveAttribute('data-variant', 'destructive');
  });

  test('shows toast with action button', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('With Action'));
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  test('auto-dismisses after duration', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Test toast')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Test toast')).not.toBeInTheDocument();
  });

  test('dismisses all toasts', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));
    fireEvent.click(screen.getByText('Show Error'));

    expect(screen.getByText('Test toast')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Dismiss All'));

    expect(screen.queryByText('Test toast')).not.toBeInTheDocument();
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });
});
