import type {
  CalendarConflict,
  AlternativeSlot,
  ConflictCheckResult,
  MeetingProposal,
} from "../types/calendar";

/**
 * Checks if two time ranges overlap
 */
export function hasOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && end1 > start2;
}

/**
 * Main function to detect calendar conflicts and suggest alternatives
 */
export function checkConflicts(
  proposedStart: Date,
  proposedEnd: Date,
  existingEvents: CalendarConflict[]
): ConflictCheckResult {
  const conflicts: CalendarConflict[] = [];

  // Find all conflicting events
  for (const event of existingEvents) {
    if (hasOverlap(proposedStart, proposedEnd, event.start, event.end)) {
      conflicts.push(event);
    }
  }

  // Find alternatives if there are conflicts
  const alternatives =
    conflicts.length > 0
      ? findAlternatives(proposedStart, proposedEnd, existingEvents)
      : [];

  const proposal: MeetingProposal = {
    title: "Proposed Meeting",
    proposedStart,
    proposedEnd,
    attendees: [],
  };

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
    alternatives,
    proposal,
  };
}

/**
 * Find alternative time slots that don't conflict with existing events
 */
function findAlternatives(
  proposedStart: Date,
  proposedEnd: Date,
  existingEvents: CalendarConflict[],
  limit: number = 3
): AlternativeSlot[] {
  const alternatives: AlternativeSlot[] = [];
  const duration = proposedEnd.getTime() - proposedStart.getTime();

  // Sort events by start time
  const sortedEvents = [...existingEvents].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  // Define working hours (9 AM to 6 PM)
  const dayStart = new Date(proposedStart);
  dayStart.setHours(9, 0, 0, 0);
  const dayEnd = new Date(proposedStart);
  dayEnd.setHours(18, 0, 0, 0);

  let currentTime = dayStart.getTime();

  // Find gaps in the schedule
  for (const event of sortedEvents) {
    const gapDuration = event.start.getTime() - currentTime;

    if (gapDuration >= duration && alternatives.length < limit) {
      alternatives.push({
        start: new Date(currentTime),
        end: new Date(currentTime + duration),
        score: calculateSlotScore(currentTime, proposedStart.getTime()),
      });
    }

    currentTime = Math.max(currentTime, event.end.getTime());
  }

  // Check time after last event
  if (dayEnd.getTime() - currentTime >= duration && alternatives.length < limit) {
    alternatives.push({
      start: new Date(currentTime),
      end: new Date(currentTime + duration),
      score: calculateSlotScore(currentTime, proposedStart.getTime()),
    });
  }

  return alternatives.slice(0, limit);
}

/**
 * Calculate a score for a slot based on proximity to preferred time
 * Higher score = closer to preferred time
 */
function calculateSlotScore(slotStart: number, preferredStart: number): number {
  const hoursDiff = Math.abs(slotStart - preferredStart) / (1000 * 60 * 60);
  return Math.max(0, 1 - hoursDiff * 0.1);
}
