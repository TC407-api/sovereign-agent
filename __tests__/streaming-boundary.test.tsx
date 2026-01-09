import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { StreamingBoundary } from '@/components/streaming/StreamingBoundary';

// Component that throws
function ErrorComponent(): JSX.Element {
  throw new Error('Test error');
}

describe('StreamingBoundary', () => {
  test('renders children when loaded', () => {
    render(
      <StreamingBoundary name="TestComponent">
        <div>Static Content</div>
      </StreamingBoundary>
    );

    expect(screen.getByText('Static Content')).toBeInTheDocument();
  });

  test('shows skeleton fallback when isLoading is true', () => {
    const { container } = render(
      <StreamingBoundary name="TestComponent" isLoading={true}>
        <div>Content</div>
      </StreamingBoundary>
    );

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  test('shows error state on failure', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <StreamingBoundary name="TestComponent">
        <ErrorComponent />
      </StreamingBoundary>
    );

    expect(screen.getByText(/error loading/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  test('allows retry after error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <StreamingBoundary name="TestComponent" onRetry={onRetry}>
        <ErrorComponent />
      </StreamingBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('calls onError callback when error occurs', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();

    render(
      <StreamingBoundary name="TestComponent" onError={onError}>
        <ErrorComponent />
      </StreamingBoundary>
    );

    expect(onError).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
