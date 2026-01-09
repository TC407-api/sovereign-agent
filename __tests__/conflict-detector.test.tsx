import { render, screen } from '@testing-library/react';
import { ConflictDetector } from '@/components/ConflictDetector';
import { describe, test, expect } from 'vitest';
import type { CalendarConflict, AlternativeSlot } from '@/lib/types/calendar';

describe('ConflictDetector Component', () => {
  const mockConflicts: CalendarConflict[] = [
    {
      eventId: 'evt-1',
      title: 'Existing Meeting',
      start: new Date('2026-01-10T10:00:00'),
      end: new Date('2026-01-10T11:00:00'),
      severity: 'hard',
    },
  ];

  const mockAlternatives: AlternativeSlot[] = [
    {
      start: new Date('2026-01-10T14:00:00'),
      end: new Date('2026-01-10T15:00:00'),
      score: 0.95,
    },
    {
      start: new Date('2026-01-10T16:00:00'),
      end: new Date('2026-01-10T17:00:00'),
      score: 0.82,
    },
  ];

  test('handles loading state', () => {
    render(<ConflictDetector conflicts={[]} alternatives={[]} isLoading={true} />);
    expect(screen.getByText(/checking/i)).toBeInTheDocument();
  });

  test('displays conflict warning when conflicts exist', () => {
    render(<ConflictDetector conflicts={mockConflicts} alternatives={[]} isLoading={false} />);
    expect(screen.getByText(/conflict/i)).toBeInTheDocument();
    expect(screen.getByText('Existing Meeting')).toBeInTheDocument();
  });

  test('shows alternative time slots when provided', () => {
    render(
      <ConflictDetector
        conflicts={mockConflicts}
        alternatives={mockAlternatives}
        isLoading={false}
      />
    );
    expect(screen.getByText(/alternative/i)).toBeInTheDocument();
  });

  test('shows success message when no conflicts', () => {
    render(<ConflictDetector conflicts={[]} alternatives={[]} isLoading={false} />);
    expect(screen.getByText(/no conflicts/i)).toBeInTheDocument();
  });
});
