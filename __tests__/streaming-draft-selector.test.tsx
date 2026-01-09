import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import { StreamingDraftSelector } from '@/components/streaming/StreamingDraftSelector';

const mockDrafts = [
  { id: 'draft-1', tone: 'professional' as const, content: 'Dear Team, Thank you for the update...', isGenerating: false },
  { id: 'draft-2', tone: 'friendly' as const, content: 'Hey! Thanks for sharing...', isGenerating: false },
  { id: 'draft-3', tone: 'concise' as const, content: 'Acknowledged. Will review.', isGenerating: true },
];

describe('StreamingDraftSelector', () => {
  test('shows loading state when all drafts generating', () => {
    const { container } = render(
      <StreamingDraftSelector
        drafts={[]}
        isLoading={true}
        onSelect={() => {}}
      />
    );
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  test('renders all draft options with tone labels', () => {
    render(
      <StreamingDraftSelector
        drafts={mockDrafts}
        isLoading={false}
        onSelect={() => {}}
      />
    );
    expect(screen.getByText(/professional/i)).toBeInTheDocument();
    expect(screen.getByText(/friendly/i)).toBeInTheDocument();
    expect(screen.getByText(/concise/i)).toBeInTheDocument();
  });

  test('shows generating indicator for drafts still loading', () => {
    render(
      <StreamingDraftSelector
        drafts={mockDrafts}
        isLoading={false}
        onSelect={() => {}}
      />
    );
    expect(screen.getByText(/generating/i)).toBeInTheDocument();
  });

  test('calls onSelect when draft is clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <StreamingDraftSelector
        drafts={mockDrafts}
        isLoading={false}
        onSelect={onSelect}
      />
    );
    const professionalBtn = screen.getByText(/professional/i).closest('button');
    await user.click(professionalBtn!);
    expect(onSelect).toHaveBeenCalledWith(mockDrafts[0]);
  });

  test('highlights selected draft', () => {
    render(
      <StreamingDraftSelector
        drafts={mockDrafts}
        isLoading={false}
        selectedId="draft-2"
        onSelect={() => {}}
      />
    );
    const selected = screen.getByText(/friendly/i).closest('button');
    expect(selected).toHaveClass('ring-2');
  });
});
