import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PendingDraftsList } from '@/components/PendingDraftsList';

describe('PendingDraftsList', () => {
  const mockDrafts = [
    {
      _id: 'draft-1' as any,
      subject: 'Re: Project Update',
      body: 'Thank you for the update...',
      generatedAt: Date.now(),
      status: 'draft' as const,
      editCount: 0,
      email: {
        _id: 'email-1' as any,
        from: 'alice@company.com',
        subject: 'Project Update',
        snippet: 'Here is the latest update on the project...',
        date: Date.now() - 3600000,
      },
    },
    {
      _id: 'draft-2' as any,
      subject: 'Re: Meeting Request',
      body: 'I would be happy to meet...',
      generatedAt: Date.now() - 1800000,
      status: 'draft' as const,
      editCount: 0,
      email: {
        _id: 'email-2' as any,
        from: 'bob@company.com',
        subject: 'Meeting Request',
        snippet: 'Can we schedule a meeting...',
        date: Date.now() - 7200000,
      },
    },
  ];

  test('displays list of pending drafts', () => {
    render(<PendingDraftsList drafts={mockDrafts} onSelectDraft={() => {}} />);

    expect(screen.getByText('Re: Project Update')).toBeInTheDocument();
    expect(screen.getByText('Re: Meeting Request')).toBeInTheDocument();
  });

  test('shows original email sender for each draft', () => {
    render(<PendingDraftsList drafts={mockDrafts} onSelectDraft={() => {}} />);

    // Component shows "Reply to [name]" format
    expect(screen.getByText(/reply to alice/i)).toBeInTheDocument();
    expect(screen.getByText(/reply to bob/i)).toBeInTheDocument();
  });

  test('displays empty state when no drafts', () => {
    render(<PendingDraftsList drafts={[]} onSelectDraft={() => {}} />);

    expect(screen.getByText(/no pending drafts/i)).toBeInTheDocument();
  });

  test('calls onSelectDraft when draft is clicked', async () => {
    const onSelectDraft = vi.fn();
    const user = userEvent.setup();

    render(<PendingDraftsList drafts={mockDrafts} onSelectDraft={onSelectDraft} />);

    const firstDraft = screen.getByText('Re: Project Update');
    await user.click(firstDraft);

    expect(onSelectDraft).toHaveBeenCalledWith(mockDrafts[0]);
  });

  test('shows draft count in header', () => {
    render(<PendingDraftsList drafts={mockDrafts} onSelectDraft={() => {}} />);

    expect(screen.getByText(/2 pending/i)).toBeInTheDocument();
  });
});
