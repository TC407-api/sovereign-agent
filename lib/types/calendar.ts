export interface MeetingProposal {
  title: string;
  proposedStart: Date;
  proposedEnd: Date;
  attendees: string[];
  location?: string;
  description?: string;
}

export interface CalendarConflict {
  eventId: string;
  title: string;
  start: Date;
  end: Date;
  severity: "hard" | "soft"; // hard = immovable, soft = flexible
}

export interface AlternativeSlot {
  start: Date;
  end: Date;
  score: number; // 0-1, higher is better
  reason?: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflicts: CalendarConflict[];
  alternatives: AlternativeSlot[];
  proposal: MeetingProposal;
}

export function isHardConflict(conflict: CalendarConflict): boolean {
  return conflict.severity === "hard";
}

export function getBestAlternative(
  alternatives: AlternativeSlot[]
): AlternativeSlot | null {
  if (alternatives.length === 0) return null;
  return alternatives.reduce((best, current) =>
    current.score > best.score ? current : best
  );
}
