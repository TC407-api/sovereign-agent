import { google, calendar_v3 } from "googleapis";

export interface CalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  status: "confirmed" | "tentative" | "cancelled";
  attendees?: Array<{
    email: string;
    name?: string;
    responseStatus?: "accepted" | "declined" | "tentative" | "needsAction";
  }>;
  recurrence?: string;
  created: Date;
  updated: Date;
}

export class CalendarService {
  private calendar: calendar_v3.Calendar;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    this.calendar = google.calendar({ version: "v3", auth });
  }

  async listEvents(
    calendarId: string = "primary",
    timeMin?: Date,
    timeMax?: Date,
    maxResults: number = 100
  ): Promise<CalendarEvent[]> {
    try {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const response = await this.calendar.events.list({
        calendarId,
        timeMin: (timeMin ?? now).toISOString(),
        timeMax: (timeMax ?? thirtyDaysFromNow).toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = response.data.items || [];

      return events.map((event) => this.parseEvent(event, calendarId));
    } catch (error) {
      console.error("Failed to list calendar events:", error);
      throw new Error("Failed to fetch events from Google Calendar");
    }
  }

  async getEvent(
    eventId: string,
    calendarId: string = "primary"
  ): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.get({
        calendarId,
        eventId,
      });

      return this.parseEvent(response.data, calendarId);
    } catch (error) {
      console.error("Failed to get calendar event:", error);
      throw new Error(`Failed to fetch event ${eventId} from Google Calendar`);
    }
  }

  private parseEvent(
    event: calendar_v3.Schema$Event,
    calendarId: string
  ): CalendarEvent {
    // Handle all-day events (date only) vs timed events (dateTime)
    const isAllDay = !event.start?.dateTime;

    let startDate: Date;
    let endDate: Date;

    if (isAllDay) {
      // All-day events use date strings like "2024-01-15"
      startDate = new Date(event.start?.date || "");
      endDate = new Date(event.end?.date || "");
    } else {
      startDate = new Date(event.start?.dateTime || "");
      endDate = new Date(event.end?.dateTime || "");
    }

    // Map Google status to our status type
    const status = this.mapStatus(event.status);

    // Parse attendees
    const attendees = event.attendees?.map((attendee) => ({
      email: attendee.email || "",
      name: attendee.displayName || undefined,
      responseStatus: this.mapResponseStatus(attendee.responseStatus),
    }));

    // Get first recurrence rule if exists
    const recurrence = event.recurrence?.[0] || undefined;

    return {
      id: event.id!,
      calendarId,
      title: event.summary || "(No title)",
      description: event.description || undefined,
      location: event.location || undefined,
      start: startDate,
      end: endDate,
      isAllDay,
      status,
      attendees,
      recurrence,
      created: new Date(event.created || ""),
      updated: new Date(event.updated || ""),
    };
  }

  private mapStatus(
    status?: string | null
  ): "confirmed" | "tentative" | "cancelled" {
    switch (status) {
      case "confirmed":
        return "confirmed";
      case "tentative":
        return "tentative";
      case "cancelled":
        return "cancelled";
      default:
        return "confirmed";
    }
  }

  private mapResponseStatus(
    status?: string | null
  ): "accepted" | "declined" | "tentative" | "needsAction" | undefined {
    switch (status) {
      case "accepted":
        return "accepted";
      case "declined":
        return "declined";
      case "tentative":
        return "tentative";
      case "needsAction":
        return "needsAction";
      default:
        return undefined;
    }
  }
}
