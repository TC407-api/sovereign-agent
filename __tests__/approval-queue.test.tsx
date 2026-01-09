import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ApprovalQueue } from '@/components/ApprovalQueue';

const mockRequests = [
  { id: 'apr-1', action: 'send_email', reason: 'External email', status: 'pending' as const, createdAt: Date.now(), expiresAt: Date.now() + 30000, payload: {}, userId: 'u1' },
  { id: 'apr-2', action: 'delete_email', reason: 'Delete request', status: 'pending' as const, createdAt: Date.now(), expiresAt: Date.now() + 60000, payload: {}, userId: 'u1' },
];

describe('ApprovalQueue', () => {
  test('renders pending count badge', () => {
    render(<ApprovalQueue requests={mockRequests} onSelect={vi.fn()} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('lists pending requests', () => {
    render(<ApprovalQueue requests={mockRequests} onSelect={vi.fn()} />);
    expect(screen.getByText(/send_email/i)).toBeInTheDocument();
    expect(screen.getByText(/delete_email/i)).toBeInTheDocument();
  });

  test('calls onSelect when request clicked', () => {
    const onSelect = vi.fn();
    render(<ApprovalQueue requests={mockRequests} onSelect={onSelect} />);
    fireEvent.click(screen.getByText(/send_email/i));
    expect(onSelect).toHaveBeenCalledWith(mockRequests[0]);
  });

  test('shows empty state when no requests', () => {
    render(<ApprovalQueue requests={[]} onSelect={vi.fn()} />);
    expect(screen.getByText(/no pending/i)).toBeInTheDocument();
  });

  test('sorts by expiration time', () => {
    const requests = [
      { ...mockRequests[0], expiresAt: Date.now() + 60000 },
      { ...mockRequests[1], expiresAt: Date.now() + 10000 },
    ];
    render(<ApprovalQueue requests={requests} onSelect={vi.fn()} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent(/delete_email/i);
  });
});
