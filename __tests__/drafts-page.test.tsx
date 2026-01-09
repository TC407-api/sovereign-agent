import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DraftsPage } from '@/components/DraftsPage';
import { vi } from 'vitest';

// Mock the usePendingDrafts hook
vi.mock('@/lib/hooks/usePendingDrafts', () => ({
  usePendingDrafts: vi.fn(),
}));

// Mock Convex mutations
vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => vi.fn()),
}));

import { usePendingDrafts } from '@/lib/hooks/usePendingDrafts';

const mockUsePendingDrafts = usePendingDrafts as ReturnType<typeof vi.fn>;

describe('DraftsPage', () => {
  const mockDrafts = [
    {
      _id: 'draft-1',
      subject: 'Re: Project Update',
      body: 'Thank you for the update. I will review it shortly.',
      originalContent: 'Thank you for the update. I will review it shortly.',
      generatedAt: Date.now(),
      status: 'draft' as const,
      editCount: 0,
      emailId: 'email-1',
      email: {
        _id: 'email-1',
        from: 'alice@company.com',
        to: 'me@company.com',
        subject: 'Project Update',
        body: 'Here is the latest update on the project...',
        snippet: 'Here is the latest update...',
        date: Date.now() - 3600000,
        gmailId: 'gmail-1',
        threadId: 'thread-1',
        isRead: true,
        isStarred: false,
        isArchived: false,
        receivedAt: Date.now() - 3600000,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows loading state while fetching drafts', () => {
    mockUsePendingDrafts.mockReturnValue({
      drafts: [],
      isLoading: true,
      count: 0,
      hasPendingDrafts: false,
    });

    render(<DraftsPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('shows empty state when no pending drafts', () => {
    mockUsePendingDrafts.mockReturnValue({
      drafts: [],
      isLoading: false,
      count: 0,
      hasPendingDrafts: false,
    });

    render(<DraftsPage />);

    expect(screen.getByText(/no pending drafts/i)).toBeInTheDocument();
  });

  test('displays list of pending drafts', () => {
    mockUsePendingDrafts.mockReturnValue({
      drafts: mockDrafts,
      isLoading: false,
      count: 1,
      hasPendingDrafts: true,
    });

    render(<DraftsPage />);

    expect(screen.getByText('Re: Project Update')).toBeInTheDocument();
    // Component shows "Reply to [name]" format
    expect(screen.getByText(/reply to alice/i)).toBeInTheDocument();
  });

  test('shows draft review when draft is selected', async () => {
    mockUsePendingDrafts.mockReturnValue({
      drafts: mockDrafts,
      isLoading: false,
      count: 1,
      hasPendingDrafts: true,
    });

    const user = userEvent.setup();
    render(<DraftsPage />);

    const draftItem = screen.getByText('Re: Project Update');
    await user.click(draftItem);

    // Should show the DraftReview component with original email context
    await waitFor(() => {
      expect(screen.getByText('Original Email')).toBeInTheDocument();
    });
  });

  test('shows page title with draft count', () => {
    mockUsePendingDrafts.mockReturnValue({
      drafts: mockDrafts,
      isLoading: false,
      count: 1,
      hasPendingDrafts: true,
    });

    render(<DraftsPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/draft reviews/i);
  });
});
