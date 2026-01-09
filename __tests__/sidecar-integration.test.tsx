import { render, screen } from '@testing-library/react';
import { SidecarPanel } from '@/components/SidecarPanel';
import { describe, test, expect, vi } from 'vitest';
import type { ContactContext } from '@/lib/types/contact';
import type { ConflictCheckResult, CalendarConflict, AlternativeSlot } from '@/lib/types/calendar';

// Integration tests: test full component without mocking children

describe('SidecarPanel Integration', () => {
  const mockContact: ContactContext = {
    contact: {
      email: 'integration@test.com',
      name: 'Integration Test',
      company: 'Test Corp',
      role: 'QA Engineer',
      lastInteraction: new Date('2026-01-09'),
      interactionCount: 25,
    },
    interactions: {
      totalEmails: 50,
      sentByMe: 20,
      receivedFromThem: 30,
      avgResponseTimeHours: 2.5,
      commonTopics: ['testing', 'quality', 'automation'],
    },
    recentThreads: [
      { threadId: 'thread-1', subject: 'Test Results', lastMessageAt: new Date() },
      { threadId: 'thread-2', subject: 'Bug Report', lastMessageAt: new Date() },
    ],
  };

  const mockConflict: CalendarConflict = {
    eventId: 'evt-conflict',
    title: 'Team Standup',
    start: new Date('2026-01-10T09:00:00'),
    end: new Date('2026-01-10T09:30:00'),
    severity: 'hard',
  };

  const mockAlternative: AlternativeSlot = {
    start: new Date('2026-01-10T14:00:00'),
    end: new Date('2026-01-10T15:00:00'),
    score: 0.9,
  };

  const mockConflictResult: ConflictCheckResult = {
    hasConflict: true,
    conflicts: [mockConflict],
    alternatives: [mockAlternative],
    proposal: {
      title: 'Review Meeting',
      proposedStart: new Date('2026-01-10T09:00:00'),
      proposedEnd: new Date('2026-01-10T10:00:00'),
      attendees: ['integration@test.com'],
    },
  };

  test('renders PrepCard with contact details in integrated view', () => {
    render(
      <SidecarPanel
        contactContext={mockContact}
        conflictResult={null}
        isLoading={false}
      />
    );

    // Should show contact info section
    expect(screen.getByText(/contact info/i)).toBeInTheDocument();
    // Should show contact name
    expect(screen.getByText('Integration Test')).toBeInTheDocument();
  });

  test('renders ConflictDetector with conflict details in integrated view', () => {
    render(
      <SidecarPanel
        contactContext={null}
        conflictResult={mockConflictResult}
        isLoading={false}
      />
    );

    // Should show calendar check section
    expect(screen.getByText(/calendar check/i)).toBeInTheDocument();
    // Should show conflict info
    expect(screen.getByText(/conflict/i)).toBeInTheDocument();
    expect(screen.getByText('Team Standup')).toBeInTheDocument();
  });

  test('renders both components when full context is provided', () => {
    render(
      <SidecarPanel
        contactContext={mockContact}
        conflictResult={mockConflictResult}
        isLoading={false}
      />
    );

    // Both sections should be visible
    expect(screen.getByText(/contact info/i)).toBeInTheDocument();
    expect(screen.getByText(/calendar check/i)).toBeInTheDocument();

    // Contact data
    expect(screen.getByText('Integration Test')).toBeInTheDocument();

    // Conflict data
    expect(screen.getByText('Team Standup')).toBeInTheDocument();
  });

  test('shows alternative slots when conflicts exist', () => {
    render(
      <SidecarPanel
        contactContext={null}
        conflictResult={mockConflictResult}
        isLoading={false}
      />
    );

    // Should show alternatives section
    expect(screen.getByText(/alternative/i)).toBeInTheDocument();
    // Should show match score
    expect(screen.getByText(/90%/)).toBeInTheDocument();
  });

  test('handles no conflict state correctly', () => {
    const noConflictResult: ConflictCheckResult = {
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

    render(
      <SidecarPanel
        contactContext={null}
        conflictResult={noConflictResult}
        isLoading={false}
      />
    );

    expect(screen.getByText(/no conflicts/i)).toBeInTheDocument();
  });
});
