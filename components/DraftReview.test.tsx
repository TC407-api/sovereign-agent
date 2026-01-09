import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DraftReview } from './DraftReview';
import { ConvexProvider } from 'convex/react';

// Mock Convex hooks
vi.mock('convex/react', async () => {
  const actual = await vi.importActual('convex/react');
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useConvex: vi.fn(),
  };
});

// Mock data for tests
const mockOriginalEmail = {
  id: 'email-1',
  from: 'client@example.com',
  subject: 'Project Proposal Discussion',
  date: new Date('2024-01-09'),
  body: 'I would like to discuss the project proposal for Q1.',
  priority: 'high' as const,
};

const mockDraftData = {
  id: 'draft-1',
  originalEmail: mockOriginalEmail,
  draftContent: 'Thank you for reaching out about the Q1 project proposal. I would be happy to discuss this with you in detail.',
  priority: 'high' as const,
  confidence: 0.87,
  status: 'pending' as const,
};

describe('DraftReview Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should display original email subject', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByText('Project Proposal Discussion')).toBeInTheDocument();
    });

    it('should display original email sender', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByText('client@example.com')).toBeInTheDocument();
    });

    it('should display AI draft content', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByText(/Thank you for reaching out/)).toBeInTheDocument();
    });

    it('should show priority badge', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      const badge = screen.getByTestId('priority-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('High');
    });

    it('should show confidence score as percentage', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByText(/87%/)).toBeInTheDocument();
    });

    it('should display section header for original email', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByText('Original Email')).toBeInTheDocument();
    });

    it('should display section header for draft reply', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByText('AI-Generated Reply')).toBeInTheDocument();
    });

    it('should render approve button', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    });

    it('should render reject button', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
    });

    it('should render edit button', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });
  });

  describe('Interactions - Button Actions', () => {
    it('should call onApprove when approve button clicked', async () => {
      const onApprove = vi.fn();
      const onReject = vi.fn();
      const onSave = vi.fn();

      render(<DraftReview draft={mockDraftData} onApprove={onApprove} onReject={onReject} onSave={onSave} />);

      const approveButton = screen.getByRole('button', { name: /approve/i });
      fireEvent.click(approveButton);

      expect(onApprove).toHaveBeenCalledWith(mockDraftData.id);
      expect(onApprove).toHaveBeenCalledTimes(1);
    });

    it('should call onReject when reject button clicked', async () => {
      const onApprove = vi.fn();
      const onReject = vi.fn();
      const onSave = vi.fn();

      render(<DraftReview draft={mockDraftData} onApprove={onApprove} onReject={onReject} onSave={onSave} />);

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      fireEvent.click(rejectButton);

      expect(onReject).toHaveBeenCalledWith(mockDraftData.id);
      expect(onReject).toHaveBeenCalledTimes(1);
    });

    it('should enter edit mode when edit button clicked', async () => {
      const user = userEvent.setup();
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Interactions - Edit Mode', () => {
    it('should show textarea in edit mode', async () => {
      const user = userEvent.setup();
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue(mockDraftData.draftContent);
    });

    it('should allow editing the textarea content', async () => {
      const user = userEvent.setup();
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'Updated draft content');

      expect(textarea).toHaveValue('Updated draft content');
    });

    it('should call onSave with edited content when save button clicked', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();

      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={onSave} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'Updated draft content');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(onSave).toHaveBeenCalledWith(mockDraftData.id, 'Updated draft content');
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('should exit edit mode after save', async () => {
      const user = userEvent.setup();
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(screen.getByRole('textbox')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });

    it('should show cancel button in edit mode', async () => {
      const user = userEvent.setup();
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should exit edit mode without saving when cancel clicked', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();

      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={onSave} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'Updated draft content');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(onSave).not.toHaveBeenCalled();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  describe('States - Loading', () => {
    it('should show loading state', () => {
      const loadingDraft = { ...mockDraftData, status: 'processing' as const };
      render(<DraftReview draft={loadingDraft} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} isLoading={true} />);
      expect(screen.getByTestId('draft-review-loading')).toBeInTheDocument();
    });

    it('should disable approve button when loading', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} isLoading={true} />);
      const approveButton = screen.getByRole('button', { name: /approve/i });
      expect(approveButton).toBeDisabled();
    });

    it('should disable reject button when loading', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} isLoading={true} />);
      const rejectButton = screen.getByRole('button', { name: /reject/i });
      expect(rejectButton).toBeDisabled();
    });

    it('should disable edit button when loading', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} isLoading={true} />);
      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toBeDisabled();
    });
  });

  describe('States - Error', () => {
    it('should show error state when error prop provided', () => {
      render(
        <DraftReview
          draft={mockDraftData}
          onApprove={vi.fn()}
          onReject={vi.fn()}
          onSave={vi.fn()}
          error="Failed to process draft"
        />
      );
      expect(screen.getByText('Failed to process draft')).toBeInTheDocument();
    });

    it('should display error message with error icon', () => {
      render(
        <DraftReview
          draft={mockDraftData}
          onApprove={vi.fn()}
          onReject={vi.fn()}
          onSave={vi.fn()}
          error="Network error"
        />
      );
      expect(screen.getByTestId('draft-review-error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('should disable approve button when error state', () => {
      render(
        <DraftReview
          draft={mockDraftData}
          onApprove={vi.fn()}
          onReject={vi.fn()}
          onSave={vi.fn()}
          error="Error occurred"
        />
      );
      const approveButton = screen.getByRole('button', { name: /approve/i });
      expect(approveButton).toBeDisabled();
    });

    it('should disable reject button when error state', () => {
      render(
        <DraftReview
          draft={mockDraftData}
          onApprove={vi.fn()}
          onReject={vi.fn()}
          onSave={vi.fn()}
          error="Error occurred"
        />
      );
      const rejectButton = screen.getByRole('button', { name: /reject/i });
      expect(rejectButton).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle long email subjects', () => {
      const longSubjectDraft = {
        ...mockDraftData,
        originalEmail: {
          ...mockOriginalEmail,
          subject: 'This is a very long email subject that might wrap to multiple lines and should display correctly without breaking the layout',
        },
      };
      render(<DraftReview draft={longSubjectDraft} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(
        screen.getByText(/This is a very long email subject/)
      ).toBeInTheDocument();
    });

    it('should handle long email body content', () => {
      const longBodyDraft = {
        ...mockDraftData,
        originalEmail: {
          ...mockOriginalEmail,
          body: 'This is a very long email body. '.repeat(20),
        },
      };
      render(<DraftReview draft={longBodyDraft} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByTestId('original-email-body')).toBeInTheDocument();
    });

    it('should handle priority "low"', () => {
      const lowPriorityDraft = {
        ...mockDraftData,
        priority: 'low' as const,
      };
      render(<DraftReview draft={lowPriorityDraft} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      const badge = screen.getByTestId('priority-badge');
      expect(badge).toBeInTheDocument();
    });

    it('should handle confidence score of 1.0 (100%)', () => {
      const highConfidenceDraft = {
        ...mockDraftData,
        confidence: 1.0,
      };
      render(<DraftReview draft={highConfidenceDraft} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByText(/100%/)).toBeInTheDocument();
    });

    it('should handle confidence score of 0.0 (0%)', () => {
      const lowConfidenceDraft = {
        ...mockDraftData,
        confidence: 0.0,
      };
      render(<DraftReview draft={lowConfidenceDraft} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByText(/0%/)).toBeInTheDocument();
    });

    it('should display original email body when present', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByTestId('original-email-body')).toHaveTextContent(
        'I would like to discuss the project proposal for Q1.'
      );
    });

    it('should handle empty draft content gracefully', () => {
      const emptyDraft = {
        ...mockDraftData,
        draftContent: '',
      };
      render(<DraftReview draft={emptyDraft} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByTestId('draft-content')).toHaveTextContent('');
    });
  });

  describe('Component Structure', () => {
    it('should have main container with proper testid', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByTestId('draft-review-container')).toBeInTheDocument();
    });

    it('should display confidence badge with proper styling', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByTestId('confidence-badge')).toBeInTheDocument();
    });

    it('should have action buttons section', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByRole('heading', { level: 2, name: /original email/i })).toBeInTheDocument();
    });

    it('should have descriptive button labels', () => {
      render(<DraftReview draft={mockDraftData} onApprove={vi.fn()} onReject={vi.fn()} onSave={vi.fn()} />);
      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('should have proper aria attributes on loading state', () => {
      render(
        <DraftReview
          draft={mockDraftData}
          onApprove={vi.fn()}
          onReject={vi.fn()}
          onSave={vi.fn()}
          isLoading={true}
        />
      );
      const loadingElement = screen.getByTestId('draft-review-loading');
      expect(loadingElement).toHaveAttribute('aria-busy', 'true');
    });

    it('should announce error state to screen readers', () => {
      render(
        <DraftReview
          draft={mockDraftData}
          onApprove={vi.fn()}
          onReject={vi.fn()}
          onSave={vi.fn()}
          error="An error occurred"
        />
      );
      const errorElement = screen.getByTestId('draft-review-error');
      expect(errorElement).toHaveAttribute('role', 'alert');
    });
  });
});
