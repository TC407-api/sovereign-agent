import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Internal mutation to insert email (used by sync action)
export const internalInsertEmail = internalMutation({
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
      return { id: existing._id, isNew: false };
    }

    const emailId = await ctx.db.insert("emails", args);
    return { id: emailId, isNew: true };
  },
});
