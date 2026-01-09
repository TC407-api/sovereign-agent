import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { SafetyDashboard } from '@/components/SafetyDashboard';

const mockProps = {
  pendingApprovals: [
    { id: 'apr-1', action: 'send_email', reason: 'External', status: 'pending' as const, createdAt: Date.now(), expiresAt: Date.now() + 30000, payload: {}, userId: 'u1' },
  ],
  recentAuditEntries: [
    { id: 'aud-1', timestamp: Date.now(), userId: 'u1', eventType: 'action_executed' as const, action: 'send_email', input: {}, durationMs: 100 },
  ],
  rateLimitStatus: { action: 'send_email', remaining: 8, resetAt: Date.now() + 30000, isBlocked: false },
};

describe('SafetyDashboard', () => {
  test('renders all sections', () => {
    render(<SafetyDashboard {...mockProps} />);
    expect(screen.getByText(/pending approvals/i)).toBeInTheDocument();
    expect(screen.getByText(/audit trail/i)).toBeInTheDocument();
    expect(screen.getByText(/rate limits/i)).toBeInTheDocument();
  });

  test('shows pending approval count', () => {
    render(<SafetyDashboard {...mockProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('displays rate limit status', () => {
    render(<SafetyDashboard {...mockProps} />);
    expect(screen.getByText(/8 remaining/i)).toBeInTheDocument();
  });

  test('shows audit entries', () => {
    render(<SafetyDashboard {...mockProps} />);
    expect(screen.getAllByText(/send_email/i).length).toBeGreaterThan(0);
  });

  test('shows empty state when no data', () => {
    render(<SafetyDashboard pendingApprovals={[]} recentAuditEntries={[]} rateLimitStatus={null} />);
    expect(screen.getByText(/all clear/i)).toBeInTheDocument();
  });
});
