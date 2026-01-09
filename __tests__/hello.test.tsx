import { render, screen } from '@testing-library/react';
import Home from '@/app/page';
import { vi } from 'vitest';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: vi.fn(),
}));

// Mock Convex
vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => undefined),
  useMutation: vi.fn(() => vi.fn()),
}));

// Mock usePendingDrafts hook
vi.mock('@/lib/hooks/usePendingDrafts', () => ({
  usePendingDrafts: vi.fn(() => ({
    drafts: [],
    isLoading: false,
    count: 0,
    hasPendingDrafts: false,
  })),
}));

describe('Dashboard', () => {
  test('displays dashboard title', () => {
    render(<Home />);
    expect(screen.getByText(/sovereign agent/i)).toBeInTheDocument();
  });
});
