import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Insert or update a label (upsert by gmailLabelId)
 */
export const insertLabel = mutation({
  args: {
    gmailLabelId: v.string(),
    name: v.string(),
    type: v.union(v.literal("system"), v.literal("user")),
    color: v.optional(v.object({
      backgroundColor: v.string(),
      textColor: v.string(),
    })),
    messageListVisibility: v.optional(v.union(
      v.literal("show"),
      v.literal("hide")
    )),
    labelListVisibility: v.optional(v.union(
      v.literal("labelShow"),
      v.literal("labelShowIfUnread"),
      v.literal("labelHide")
    )),
  },
  handler: async (ctx, args) => {
    // Check if label already exists (upsert by gmailLabelId)
    const existing = await ctx.db
      .query("labels")
      .withIndex("by_gmail_label_id", (q) => q.eq("gmailLabelId", args.gmailLabelId))
      .first();

    if (existing) {
      // Update existing label
      const { gmailLabelId, ...updates } = args;
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }

    // Insert new label
    const labelId = await ctx.db.insert("labels", args);
    return labelId;
  },
});

/**
 * Delete a label by gmailLabelId
 */
export const deleteLabel = mutation({
  args: {
    gmailLabelId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("labels")
      .withIndex("by_gmail_label_id", (q) => q.eq("gmailLabelId", args.gmailLabelId))
      .first();

    if (!existing) {
      throw new Error(`Label with gmailLabelId ${args.gmailLabelId} not found`);
    }

    await ctx.db.delete(existing._id);
    return existing._id;
  },
});

/**
 * List all labels, optionally filtered by type
 */
export const listLabels = query({
  args: {
    type: v.optional(v.union(v.literal("system"), v.literal("user"))),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("labels")
        .withIndex("by_type", (q) => q.eq("type", args.type))
        .collect();
    }

    return await ctx.db.query("labels").collect();
  },
});

/**
 * Get a label by gmailLabelId
 */
export const getLabel = query({
  args: {
    gmailLabelId: v.string(),
  },
  handler: async (ctx, args) => {
    const label = await ctx.db
      .query("labels")
      .withIndex("by_gmail_label_id", (q) => q.eq("gmailLabelId", args.gmailLabelId))
      .first();

    return label;
  },
});

/**
 * Apply a label to an email (adds label to email's labels array)
 * Note: Requires 'labels' field on emails table schema
 */
export const applyLabelToEmail = mutation({
  args: {
    emailId: v.id("emails"),
    gmailLabelId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify email exists
    const email = await ctx.db.get(args.emailId);
    if (!email) {
      throw new Error(`Email ${args.emailId} not found`);
    }

    // Verify label exists
    const label = await ctx.db
      .query("labels")
      .withIndex("by_gmail_label_id", (q) => q.eq("gmailLabelId", args.gmailLabelId))
      .first();

    if (!label) {
      throw new Error(`Label with gmailLabelId ${args.gmailLabelId} not found`);
    }

    // Get current labels array (default to empty array if not set)
    const currentLabels: string[] = (email as { labels?: string[] }).labels ?? [];

    // Check if label already applied
    if (currentLabels.includes(args.gmailLabelId)) {
      return; // Label already applied, nothing to do
    }

    // Add label to array
    await ctx.db.patch(args.emailId, {
      labels: [...currentLabels, args.gmailLabelId],
    });
  },
});

/**
 * Remove a label from an email (removes label from email's labels array)
 * Note: Requires 'labels' field on emails table schema
 */
export const removeLabelFromEmail = mutation({
  args: {
    emailId: v.id("emails"),
    gmailLabelId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify email exists
    const email = await ctx.db.get(args.emailId);
    if (!email) {
      throw new Error(`Email ${args.emailId} not found`);
    }

    // Get current labels array (default to empty array if not set)
    const currentLabels: string[] = (email as { labels?: string[] }).labels ?? [];

    // Check if label is applied
    if (!currentLabels.includes(args.gmailLabelId)) {
      return; // Label not applied, nothing to do
    }

    // Remove label from array
    const updatedLabels = currentLabels.filter((id) => id !== args.gmailLabelId);
    await ctx.db.patch(args.emailId, {
      labels: updatedLabels,
    });
  },
});
