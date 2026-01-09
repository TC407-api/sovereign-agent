import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ApprovalDialog } from '@/components/ApprovalDialog';

const mockRequest = {
  id: 'apr-123',
  userId: 'user-1',
  action: 'send_email',
  payload: { to: 'test@example.com', body: 'Hello' },
  reason: 'Sending to external recipient',
  status: 'pending' as const,
  createdAt: Date.now(),
  expiresAt: Date.now() + 30000,
};

describe('ApprovalDialog', () => {
  test('renders approval request details', () => {
    render(<ApprovalDialog request={mockRequest} onApprove={vi.fn()} onReject={vi.fn()} />);
    expect(screen.getByText(/send_email/i)).toBeInTheDocument();
    expect(screen.getByText(/external recipient/i)).toBeInTheDocument();
  });

  test('calls onApprove when approve button clicked', () => {
    const onApprove = vi.fn();
    render(<ApprovalDialog request={mockRequest} onApprove={onApprove} onReject={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /approve/i }));
    expect(onApprove).toHaveBeenCalledWith('apr-123');
  });

  test('calls onReject when reject button clicked', () => {
    const onReject = vi.fn();
    render(<ApprovalDialog request={mockRequest} onApprove={vi.fn()} onReject={onReject} />);
    fireEvent.click(screen.getByRole('button', { name: /reject/i }));
    expect(onReject).toHaveBeenCalledWith('apr-123');
  });

  test('shows countdown timer', () => {
    render(<ApprovalDialog request={mockRequest} onApprove={vi.fn()} onReject={vi.fn()} />);
    expect(screen.getByText(/expires/i)).toBeInTheDocument();
  });

  test('displays payload preview', () => {
    render(<ApprovalDialog request={mockRequest} onApprove={vi.fn()} onReject={vi.fn()} />);
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });
});
