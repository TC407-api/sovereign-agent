import { describe, expect, test } from "vitest";
import { checkConflicts, hasOverlap } from "./conflict-detector";
import type { CalendarConflict } from "../types/calendar";

describe("Calendar Conflict Detection", () => {
  const existingEvents: CalendarConflict[] = [
    {
      eventId: "evt-1",
      title: "Morning Sync",
      start: new Date("2026-01-10T09:00:00"),
      end: new Date("2026-01-10T10:00:00"),
      severity: "hard",
    },
    {
      eventId: "evt-2",
      title: "Lunch Break",
      start: new Date("2026-01-10T12:00:00"),
      end: new Date("2026-01-10T13:00:00"),
      severity: "soft",
    },
  ];

  test("detects overlapping events", () => {
    const proposedStart = new Date("2026-01-10T09:30:00");
    const proposedEnd = new Date("2026-01-10T10:30:00");

    const result = checkConflicts(proposedStart, proposedEnd, existingEvents);

    expect(result.hasConflict).toBe(true);
    expect(result.conflicts.length).toBeGreaterThan(0);
    expect(result.conflicts[0].title).toBe("Morning Sync");
  });

  test("returns no conflicts for free time", () => {
    const proposedStart = new Date("2026-01-10T14:00:00");
    const proposedEnd = new Date("2026-01-10T15:00:00");

    const result = checkConflicts(proposedStart, proposedEnd, existingEvents);

    expect(result.hasConflict).toBe(false);
    expect(result.conflicts).toHaveLength(0);
  });

  test("suggests alternative slots when conflicts exist", () => {
    const proposedStart = new Date("2026-01-10T09:00:00");
    const proposedEnd = new Date("2026-01-10T10:00:00");

    const result = checkConflicts(proposedStart, proposedEnd, existingEvents);

    expect(result.hasConflict).toBe(true);
    expect(result.alternatives.length).toBeGreaterThan(0);
  });

  test("hasOverlap correctly identifies overlapping time ranges", () => {
    // Overlapping case
    expect(
      hasOverlap(
        new Date("2026-01-10T09:00:00"),
        new Date("2026-01-10T10:00:00"),
        new Date("2026-01-10T09:30:00"),
        new Date("2026-01-10T10:30:00")
      )
    ).toBe(true);

    // Non-overlapping case
    expect(
      hasOverlap(
        new Date("2026-01-10T09:00:00"),
        new Date("2026-01-10T10:00:00"),
        new Date("2026-01-10T11:00:00"),
        new Date("2026-01-10T12:00:00")
      )
    ).toBe(false);
  });
});
