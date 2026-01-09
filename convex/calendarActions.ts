"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Action to sync calendar events from Google Calendar
export const syncCalendar = action({
  args: {
    accessToken: v.string(),
    calendarId: v.optional(v.string()),
    daysAhead: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ synced: number; updated: number; errors: number }> => {
    const calendarId = args.calendarId ?? "primary";
    const daysAhead = args.daysAhead ?? 30;

    // Dynamically import CalendarService to avoid bundling issues
    const { CalendarService } = await import("../lib/calendar");
    const calendar = new CalendarService(args.accessToken);

    let synced = 0;
    let updated = 0;
    let errors = 0;

    try {
      // Calculate time range
      const now = new Date();
      const timeMax = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

      // Fetch events from Google Calendar
      const events = await calendar.listEvents(calendarId, now, timeMax, 250);

      // Sync each event
      for (const event of events) {
        try {
          const result = await ctx.runMutation(internal.calendar.internalInsertEvent, {
            googleEventId: event.id,
            calendarId: event.calendarId,
            title: event.title,
            description: event.description,
            location: event.location,
            start: event.start.getTime(),
            end: event.end.getTime(),
            isAllDay: event.isAllDay,
            status: event.status,
            attendees: event.attendees,
            recurrence: event.recurrence,
            createdAt: event.created.getTime(),
            updatedAt: event.updated.getTime(),
          });

          if (result.isNew) {
            synced++;
          } else {
            updated++;
          }
        } catch (error) {
          console.error(`Failed to sync event ${event.id}:`, error);
          errors++;
        }
      }
    } catch (error) {
      console.error("Failed to list calendar events:", error);
      throw new Error("Failed to sync events from Google Calendar");
    }

    return { synced, updated, errors };
  },
});
