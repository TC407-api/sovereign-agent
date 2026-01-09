import { render, screen } from '@testing-library/react';
import { SidecarPanel } from '@/components/SidecarPanel';
import { describe, test, expect, vi } from 'vitest';
import type { ContactContext } from '@/lib/types/contact';
import type { ConflictCheckResult } from '@/lib/types/calendar';
import type { ContactContext as PrepCardContext } from '@/components/PrepCard';

// Mock the child components
vi.mock('@/components/PrepCard', () => ({
  PrepCard: ({ context }: { context: PrepCardContext }) => (
    <div data-testid="prep-card">{context.email}</div>
  ),
  ContactContext: {},
}));

vi.mock('@/components/ConflictDetector', () => ({
  ConflictDetector: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="conflict-detector">{isLoading ? 'Loading...' : 'Conflicts'}</div>
  ),
}));

describe('SidecarPanel Component', () => {
  const mockContactContext: ContactContext = {
    contact: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      company: 'Acme Corp',
      role: 'Product Manager',
      lastInteraction: new Date('2026-01-08'),
      interactionCount: 15,
    },
    interactions: {
      totalEmails: 30,
      sentByMe: 12,
      receivedFromThem: 18,
      avgResponseTimeHours: 4.5,
      commonTopics: ['product roadmap', 'feature requests'],
    },
    recentThreads: [
      { threadId: 'thread-1', subject: 'Q1 Planning', lastMessageAt: new Date() },
    ],
  };

  const mockConflictResult: ConflictCheckResult = {
    hasConflict: false,
    conflicts: [],
    alternatives: [],
    proposal: {
      title: 'Meeting',
      proposedStart: new Date(),
      proposedEnd: new Date(),
      attendees: [],
    },
  };

  test('renders loading state when data is loading', () => {
    render(
      <SidecarPanel
        contactContext={null}
        conflictResult={null}
        isLoading={true}
      />
    );
    expect(screen.getByText(/loading context/i)).toBeInTheDocument();
  });

  test('renders PrepCard when contact context is provided', () => {
    render(
      <SidecarPanel
        contactContext={mockContactContext}
        conflictResult={null}
        isLoading={false}
      />
    );
    expect(screen.getByTestId('prep-card')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  test('renders ConflictDetector when conflict result is provided', () => {
    render(
      <SidecarPanel
        contactContext={null}
        conflictResult={mockConflictResult}
        isLoading={false}
      />
    );
    expect(screen.getByTestId('conflict-detector')).toBeInTheDocument();
  });

  test('renders both PrepCard and ConflictDetector when both are provided', () => {
    render(
      <SidecarPanel
        contactContext={mockContactContext}
        conflictResult={mockConflictResult}
        isLoading={false}
      />
    );
    expect(screen.getByTestId('prep-card')).toBeInTheDocument();
    expect(screen.getByTestId('conflict-detector')).toBeInTheDocument();
  });

  test('renders empty state when no context is available', () => {
    render(
      <SidecarPanel
        contactContext={null}
        conflictResult={null}
        isLoading={false}
      />
    );
    expect(screen.getByText(/select an email/i)).toBeInTheDocument();
  });
});
