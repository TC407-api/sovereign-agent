import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const insertEmail = mutation({
  args: {
    gmailId: v.string(),
    threadId: v.string(),
    from: v.string(),
    to: v.string(),
    subject: v.string(),
    body: v.string(),
    snippet: v.string(),
    date: v.number(),
    receivedAt: v.number(),
    isRead: v.boolean(),
    isStarred: v.boolean(),
    isArchived: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists (deduplication)
    const existing = await ctx.db
      .query("emails")
      .withIndex("by_gmail_id", (q) => q.eq("gmailId", args.gmailId))
      .first();

    if (existing) {
      return existing._id;
    }

    const emailId = await ctx.db.insert("emails", args);
    return emailId;
  },
});

export const listEmails = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
    priority: v.optional(v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("normal")
    )),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    let emailsQuery = ctx.db
      .query("emails")
      .withIndex("by_date")
      .order("desc");

    // Apply filters
    if (args.unreadOnly) {
      emailsQuery = emailsQuery.filter((q) => q.eq(q.field("isRead"), false));
    }

    if (args.priority) {
      emailsQuery = emailsQuery.filter((q) =>
        q.eq(q.field("priority"), args.priority)
      );
    }

    return await emailsQuery.take(limit);
  },
});

export const getEmail = query({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    const email = await ctx.db.get(args.id);
    return email;
  },
});

export const updateEmail = mutation({
  args: {
    id: v.id("emails"),
    isRead: v.optional(v.boolean()),
    isStarred: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    priority: v.optional(v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("normal")
    )),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Verify email exists
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error(`Email ${id} not found`);
    }

    // Filter out undefined values
    const definedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(definedUpdates).length === 0) {
      return; // Nothing to update
    }

    await ctx.db.patch(id, definedUpdates);
  },
});
