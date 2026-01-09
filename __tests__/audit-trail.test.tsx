import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { AuditTrail } from '@/components/AuditTrail';

const mockEntries = [
  { id: 'aud-1', timestamp: Date.now() - 60000, userId: 'u1', eventType: 'action_executed' as const, action: 'send_email', input: {}, durationMs: 100 },
  { id: 'aud-2', timestamp: Date.now(), userId: 'u1', eventType: 'draft_generated' as const, action: 'generate_draft', input: {}, durationMs: 200 },
];

describe('AuditTrail', () => {
  test('renders timeline of events', () => {
    render(<AuditTrail entries={mockEntries} />);
    expect(screen.getByText(/send_email/i)).toBeInTheDocument();
    expect(screen.getByText(/generate_draft/i)).toBeInTheDocument();
  });

  test('shows event type badges', () => {
    render(<AuditTrail entries={mockEntries} />);
    expect(screen.getByText(/action_executed/i)).toBeInTheDocument();
  });

  test('displays timestamp', () => {
    render(<AuditTrail entries={mockEntries} />);
    expect(screen.getAllByText(/ago/i).length).toBeGreaterThan(0);
  });

  test('expands entry to show details', () => {
    render(<AuditTrail entries={mockEntries} />);
    fireEvent.click(screen.getByText(/send_email/i));
    expect(screen.getByText(/100ms/i)).toBeInTheDocument();
  });

  test('shows empty state when no entries', () => {
    render(<AuditTrail entries={[]} />);
    expect(screen.getByText(/no activity/i)).toBeInTheDocument();
  });
});
