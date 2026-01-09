import { describe, expect, test } from "vitest";
import type {
  MeetingProposal,
  CalendarConflict,
  AlternativeSlot,
  ConflictCheckResult,
} from "./calendar";
import { isHardConflict, getBestAlternative } from "./calendar";

describe("Calendar Types", () => {
  test("MeetingProposal has required fields", () => {
    const proposal: MeetingProposal = {
      title: "Weekly Sync",
      proposedStart: new Date("2026-01-10T10:00:00"),
      proposedEnd: new Date("2026-01-10T11:00:00"),
      attendees: ["john@company.com", "jane@company.com"],
    };

    expect(proposal.title).toBe("Weekly Sync");
    expect(proposal.attendees).toHaveLength(2);
  });

  test("CalendarConflict identifies blocking event", () => {
    const conflict: CalendarConflict = {
      eventId: "evt-123",
      title: "Existing Meeting",
      start: new Date("2026-01-10T10:30:00"),
      end: new Date("2026-01-10T11:30:00"),
      severity: "hard",
    };

    expect(conflict.severity).toBe("hard");
    expect(isHardConflict(conflict)).toBe(true);
  });

  test("AlternativeSlot suggests free time", () => {
    const slot: AlternativeSlot = {
      start: new Date("2026-01-10T14:00:00"),
      end: new Date("2026-01-10T15:00:00"),
      score: 0.9,
    };

    expect(slot.score).toBeGreaterThan(0.5);
  });

  test("getBestAlternative returns highest scored slot", () => {
    const alternatives: AlternativeSlot[] = [
      { start: new Date("2026-01-10T14:00:00"), end: new Date("2026-01-10T15:00:00"), score: 0.7 },
      { start: new Date("2026-01-10T16:00:00"), end: new Date("2026-01-10T17:00:00"), score: 0.95 },
      { start: new Date("2026-01-10T09:00:00"), end: new Date("2026-01-10T10:00:00"), score: 0.5 },
    ];

    const best = getBestAlternative(alternatives);
    expect(best?.score).toBe(0.95);
  });

  test("getBestAlternative returns null for empty array", () => {
    expect(getBestAlternative([])).toBeNull();
  });
});
