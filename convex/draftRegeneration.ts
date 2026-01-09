import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Internal mutation to create a new draft version
 */
export const createDraftVersion = mutation({
  args: {
    emailId: v.id("emails"),
    subject: v.string(),
    body: v.string(),
    userFeedback: v.string(),
    version: v.number(),
  },
  handler: async (ctx, args) => {
    const draftId = await ctx.db.insert("drafts", {
      emailId: args.emailId,
      subject: args.subject,
      body: args.body,
      generatedAt: Date.now(),
      status: "draft",
      metadata: {
        model: "gpt-4o-mini",
        temperature: 0.7,
        userFeedback: args.userFeedback,
        version: args.version,
      },
    });

    return draftId;
  },
});

/**
 * Schedule a draft for sending at a future time
 * Validates that the scheduled time is in the future
 */
export const scheduleDraft = mutation({
  args: {
    draftId: v.id("drafts"),
    scheduledSendTime: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate that the scheduled time is in the future
    if (args.scheduledSendTime < Date.now()) {
      throw new Error("Cannot schedule email for past time");
    }

    // Get the draft
    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      throw new Error("Draft not found");
    }

    // Update draft with scheduled time and status
    await ctx.db.patch(args.draftId, {
      status: "scheduled",
      metadata: {
        ...draft.metadata,
        scheduledSendTime: args.scheduledSendTime,
      },
    });

    return args.draftId;
  },
});

/**
 * Get all versions of a draft for a specific email
 * Returns versions ordered by generatedAt in descending order (newest first)
 */
export const getDraftVersions = query({
  args: {
    emailId: v.id("emails"),
  },
  handler: async (ctx, args) => {
    // Query all drafts for this email
    const drafts = await ctx.db
      .query("drafts")
      .filter((q) => q.eq(q.field("emailId"), args.emailId))
      .collect();

    // Sort by generatedAt descending (newest first)
    const sortedDrafts = drafts.sort(
      (a, b) => b.generatedAt - a.generatedAt
    );

    return sortedDrafts;
  },
});
