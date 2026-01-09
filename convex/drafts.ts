import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createDraft = mutation({
  args: {
    emailId: v.id("emails"),
    subject: v.string(),
    body: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const draftId = await ctx.db.insert("drafts", {
      emailId: args.emailId,
      subject: args.subject,
      body: args.body,
      originalContent: args.body,
      generatedAt: Date.now(),
      status: "draft",
      editCount: 0,
      metadata: {
        model: args.model,
      },
    });
    return draftId;
  },
});

export const approveDraft = mutation({
  args: {
    id: v.id("drafts"),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.id);

    if (!draft) {
      throw new Error(`Draft ${args.id} not found`);
    }

    await ctx.db.patch(args.id, {
      status: "approved",
      approvedAt: Date.now(),
    });
  },
});

export const rejectDraft = mutation({
  args: {
    id: v.id("drafts"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.id);

    if (!draft) {
      throw new Error(`Draft ${args.id} not found`);
    }

    await ctx.db.patch(args.id, {
      status: "rejected",
      rejectedAt: Date.now(),
      rejectionReason: args.reason,
    });
  },
});

export const updateDraft = mutation({
  args: {
    id: v.id("drafts"),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.id);

    if (!draft) {
      throw new Error(`Draft ${args.id} not found`);
    }

    const updates: Record<string, any> = {
      editCount: draft.editCount + 1,
    };

    if (args.subject !== undefined) {
      updates.subject = args.subject;
    }

    if (args.body !== undefined) {
      updates.body = args.body;
    }

    await ctx.db.patch(args.id, updates);
  },
});

// Query to get pending drafts for review
export const getPendingDrafts = query({
  args: {},
  handler: async (ctx) => {
    const drafts = await ctx.db
      .query("drafts")
      .withIndex("by_status", (q) => q.eq("status", "draft"))
      .collect();

    // Sort by generatedAt descending (newest first)
    const sortedDrafts = drafts.sort((a, b) => b.generatedAt - a.generatedAt);

    // Fetch associated emails for context
    const draftsWithEmails = await Promise.all(
      sortedDrafts.map(async (draft) => {
        const email = await ctx.db.get(draft.emailId);
        return {
          ...draft,
          email,
        };
      })
    );

    return draftsWithEmails;
  },
});

// Query to get a single draft by ID with its email
export const getDraft = query({
  args: {
    id: v.id("drafts"),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.id);
    if (!draft) {
      return null;
    }

    const email = await ctx.db.get(draft.emailId);
    return {
      ...draft,
      email,
    };
  },
});
