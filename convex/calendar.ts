import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Internal mutation to insert or update an event (upsert by googleEventId)
export const internalInsertEvent = internalMutation({
  args: {
    googleEventId: v.string(),
    calendarId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    start: v.number(),
    end: v.number(),
    isAllDay: v.boolean(),
    status: v.union(
      v.literal("confirmed"),
      v.literal("tentative"),
      v.literal("cancelled")
    ),
    attendees: v.optional(
      v.array(
        v.object({
          email: v.string(),
          name: v.optional(v.string()),
          responseStatus: v.optional(
            v.union(
              v.literal("accepted"),
              v.literal("declined"),
              v.literal("tentative"),
              v.literal("needsAction")
            )
          ),
        })
      )
    ),
    recurrence: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if event already exists (upsert by googleEventId)
    const existing = await ctx.db
      .query("events")
      .withIndex("by_google_event_id", (q) =>
        q.eq("googleEventId", args.googleEventId)
      )
      .first();

    if (existing) {
      // Update existing event
      await ctx.db.patch(existing._id, args);
      return { id: existing._id, isNew: false };
    }

    // Insert new event
    const eventId = await ctx.db.insert("events", args);
    return { id: eventId, isNew: true };
  },
});

// Public mutation to insert or update an event (upsert by googleEventId)
export const insertEvent = mutation({
  args: {
    googleEventId: v.string(),
    calendarId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    start: v.number(),
    end: v.number(),
    isAllDay: v.boolean(),
    status: v.union(
      v.literal("confirmed"),
      v.literal("tentative"),
      v.literal("cancelled")
    ),
    attendees: v.optional(
      v.array(
        v.object({
          email: v.string(),
          name: v.optional(v.string()),
          responseStatus: v.optional(
            v.union(
              v.literal("accepted"),
              v.literal("declined"),
              v.literal("tentative"),
              v.literal("needsAction")
            )
          ),
        })
      )
    ),
    recurrence: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if event already exists (upsert by googleEventId)
    const existing = await ctx.db
      .query("events")
      .withIndex("by_google_event_id", (q) =>
        q.eq("googleEventId", args.googleEventId)
      )
      .first();

    if (existing) {
      // Update existing event
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    // Insert new event
    const eventId = await ctx.db.insert("events", args);
    return eventId;
  },
});

// Query to list events within a date range
export const listEvents = query({
  args: {
    startDate: v.optional(v.number()), // Unix timestamp
    endDate: v.optional(v.number()), // Unix timestamp
    limit: v.optional(v.number()),
    calendarId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const now = Date.now();

    // Default: events from now to 30 days in the future
    const startDate = args.startDate ?? now;
    const endDate = args.endDate ?? now + 30 * 24 * 60 * 60 * 1000;

    let eventsQuery = ctx.db
      .query("events")
      .withIndex("by_start")
      .order("asc");

    // Filter by date range and optionally by calendar
    const events = await eventsQuery
      .filter((q) =>
        q.and(
          q.gte(q.field("start"), startDate),
          q.lte(q.field("start"), endDate),
          args.calendarId
            ? q.eq(q.field("calendarId"), args.calendarId)
            : true
        )
      )
      .take(limit);

    return events;
  },
});

// Query to get a single event by ID
export const getEvent = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    return event;
  },
});

// Query to get event by Google Event ID
export const getEventByGoogleId = query({
  args: { googleEventId: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_google_event_id", (q) =>
        q.eq("googleEventId", args.googleEventId)
      )
      .first();
    return event;
  },
});

// Mutation to update an event's status
export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    start: v.optional(v.number()),
    end: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("confirmed"),
        v.literal("tentative"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Verify event exists
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error(`Event ${id} not found`);
    }

    // Filter out undefined values
    const definedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(definedUpdates).length === 0) {
      return; // Nothing to update
    }

    // Update the updatedAt timestamp
    await ctx.db.patch(id, {
      ...definedUpdates,
      updatedAt: Date.now(),
    });
  },
});

// Mutation to delete an event
export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error(`Event ${args.id} not found`);
    }

    await ctx.db.delete(args.id);
  },
});
