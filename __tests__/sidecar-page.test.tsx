import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidecarPage } from '@/components/SidecarPage';
import { describe, test, expect, vi } from 'vitest';

// Mock the hooks
vi.mock('@/lib/hooks/useSidecarContext', () => ({
  useSidecarContext: vi.fn(() => ({
    contactContext: null,
    isLoading: false,
    error: null,
  })),
}));

vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => undefined),
}));

describe('SidecarPage Component', () => {
  test('renders the page with title', () => {
    render(<SidecarPage />);
    expect(screen.getByText(/ai sidecar/i)).toBeInTheDocument();
  });

  test('renders email input field', () => {
    render(<SidecarPage />);
    expect(screen.getByPlaceholderText(/sender@example.com/i)).toBeInTheDocument();
  });

  test('renders Load Context button', () => {
    render(<SidecarPage />);
    expect(screen.getByRole('button', { name: /load context/i })).toBeInTheDocument();
  });

  test('renders email content textarea for meeting proposals', () => {
    render(<SidecarPage />);
    expect(screen.getByPlaceholderText(/meeting request/i)).toBeInTheDocument();
  });

  test('shows empty state when no email is selected', () => {
    render(<SidecarPage />);
    expect(screen.getByText(/select an email/i)).toBeInTheDocument();
  });
});
