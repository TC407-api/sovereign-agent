import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock googleapis before importing CalendarService
vi.mock("googleapis", () => {
  const mockList = vi.fn().mockResolvedValue({
    data: {
      items: [
        {
          id: "event-1",
          summary: "Team Meeting",
          description: "Weekly sync",
          location: "Conference Room A",
          start: { dateTime: "2026-01-10T10:00:00Z" },
          end: { dateTime: "2026-01-10T11:00:00Z" },
          status: "confirmed",
          attendees: [
            { email: "alice@example.com", displayName: "Alice", responseStatus: "accepted" },
            { email: "bob@example.com", displayName: "Bob", responseStatus: "tentative" },
          ],
          created: "2026-01-05T08:00:00Z",
          updated: "2026-01-05T08:00:00Z",
        },
        {
          id: "event-2",
          summary: "All Day Event",
          start: { date: "2026-01-15" },
          end: { date: "2026-01-16" },
          status: "confirmed",
          created: "2026-01-05T09:00:00Z",
          updated: "2026-01-05T09:00:00Z",
        },
      ],
    },
  });

  const mockGet = vi.fn().mockResolvedValue({
    data: {
      id: "event-1",
      summary: "Team Meeting",
      description: "Weekly sync",
      location: "Conference Room A",
      start: { dateTime: "2026-01-10T10:00:00Z" },
      end: { dateTime: "2026-01-10T11:00:00Z" },
      status: "confirmed",
      attendees: [
        { email: "alice@example.com", displayName: "Alice", responseStatus: "accepted" },
      ],
      created: "2026-01-05T08:00:00Z",
      updated: "2026-01-05T08:00:00Z",
    },
  });

  // Create a proper class for OAuth2
  class MockOAuth2 {
    setCredentials = vi.fn();
  }

  return {
    google: {
      auth: {
        OAuth2: MockOAuth2,
      },
      calendar: vi.fn(() => ({
        events: {
          list: mockList,
          get: mockGet,
        },
      })),
    },
  };
});

// Import after mocking
import { CalendarService } from "./calendar";

describe("CalendarService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("listEvents returns events from Google Calendar API", async () => {
    const service = new CalendarService("fake-access-token");

    const events = await service.listEvents("primary");

    expect(events).toHaveLength(2);

    // Check first event (timed event)
    expect(events[0].id).toBe("event-1");
    expect(events[0].title).toBe("Team Meeting");
    expect(events[0].description).toBe("Weekly sync");
    expect(events[0].location).toBe("Conference Room A");
    expect(events[0].isAllDay).toBe(false);
    expect(events[0].status).toBe("confirmed");
    expect(events[0].attendees).toHaveLength(2);
    expect(events[0].attendees?.[0].email).toBe("alice@example.com");
    expect(events[0].attendees?.[0].responseStatus).toBe("accepted");

    // Check second event (all-day event)
    expect(events[1].id).toBe("event-2");
    expect(events[1].title).toBe("All Day Event");
    expect(events[1].isAllDay).toBe(true);
  });

  test("getEvent returns a single event", async () => {
    const service = new CalendarService("fake-access-token");

    const event = await service.getEvent("event-1");

    expect(event.id).toBe("event-1");
    expect(event.title).toBe("Team Meeting");
    expect(event.description).toBe("Weekly sync");
    expect(event.location).toBe("Conference Room A");
    expect(event.isAllDay).toBe(false);
    expect(event.status).toBe("confirmed");
    expect(event.calendarId).toBe("primary");
    expect(event.attendees).toHaveLength(1);
    expect(event.attendees?.[0].name).toBe("Alice");
  });
});
