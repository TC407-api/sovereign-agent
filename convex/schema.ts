import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  emails: defineTable({
    // Gmail metadata
    gmailId: v.string(),
    threadId: v.string(),

    // Email content
    from: v.string(),
    to: v.string(),
    subject: v.string(),
    body: v.string(),
    snippet: v.string(), // First 150 chars

    // Timestamps
    date: v.number(), // Unix timestamp
    receivedAt: v.number(),

    // Classification (will be populated later)
    priority: v.optional(v.union(
      v.literal("urgent"),
      v.literal("important"),
      v.literal("normal"),
      v.literal("low-priority"),
      v.literal("unclassifiable") // For failed classifications
    )),
    category: v.optional(v.string()),

    // Phase 2: Triage metadata
    priorityConfidence: v.optional(v.number()), // 0.0 to 1.0
    triagedAt: v.optional(v.number()), // Unix timestamp
    metadata: v.optional(v.object({
      reasoning: v.optional(v.string()),
    })),

    // Status flags
    isRead: v.boolean(),
    isStarred: v.boolean(),
    isArchived: v.boolean(),

    // Shadow processing status (Phase 2)
    shadowProcessed: v.optional(v.boolean()),
    hasDraft: v.optional(v.boolean()),

    // Labels (array of gmailLabelId strings)
    labels: v.optional(v.array(v.string())),
  })
    .index("by_gmail_id", ["gmailId"])
    .index("by_thread_id", ["threadId"])
    .index("by_date", ["date"])
    .index("by_priority", ["priority"]),

  events: defineTable({
    // Google Calendar metadata
    googleEventId: v.string(),
    calendarId: v.string(),

    // Event content
    title: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),

    // Time information
    start: v.number(), // Unix timestamp
    end: v.number(),   // Unix timestamp
    isAllDay: v.boolean(),

    // Event status
    status: v.union(
      v.literal("confirmed"),
      v.literal("tentative"),
      v.literal("cancelled")
    ),

    // Attendees with response status
    attendees: v.optional(v.array(v.object({
      email: v.string(),
      name: v.optional(v.string()),
      responseStatus: v.optional(v.union(
        v.literal("accepted"),
        v.literal("declined"),
        v.literal("tentative"),
        v.literal("needsAction")
      )),
    }))),

    // Recurrence rule
    recurrence: v.optional(v.string()), // RRULE format

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_google_event_id", ["googleEventId"])
    .index("by_start", ["start"])
    .index("by_calendar_id", ["calendarId"]),

  labels: defineTable({
    // Gmail label metadata
    gmailLabelId: v.string(),
    name: v.string(),
    type: v.union(v.literal("system"), v.literal("user")),

    // Optional styling
    color: v.optional(v.object({
      backgroundColor: v.string(),
      textColor: v.string(),
    })),

    // Visibility settings
    messageListVisibility: v.optional(v.union(
      v.literal("show"),
      v.literal("hide")
    )),
    labelListVisibility: v.optional(v.union(
      v.literal("labelShow"),
      v.literal("labelShowIfUnread"),
      v.literal("labelHide")
    )),
  })
    .index("by_gmail_label_id", ["gmailLabelId"])
    .index("by_type", ["type"]),

  // Phase 2: Draft management
  drafts: defineTable({
    emailId: v.id("emails"),
    subject: v.string(),
    body: v.string(),
    originalContent: v.string(),
    generatedAt: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("sent"),
      v.literal("discarded")
    ),
    editCount: v.number(),
    approvedAt: v.optional(v.number()),
    rejectedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    metadata: v.optional(v.object({
      model: v.string(),
      temperature: v.optional(v.number()),
      version: v.optional(v.number()),
      userFeedback: v.optional(v.string()),
      scheduledSendTime: v.optional(v.number()),
    })),
  })
    .index("by_email_id", ["emailId"])
    .index("by_status", ["status"]),

  // Phase 4: Contact management
  contacts: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    lastInteraction: v.number(),
    interactionCount: v.number(),
    commonTopics: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_interaction_count", ["interactionCount"]),
});
