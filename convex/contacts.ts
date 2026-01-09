import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const upsertContact = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("contacts", {
      email: args.email,
      name: args.name,
      company: args.company,
      role: args.role,
      avatarUrl: args.avatarUrl,
      lastInteraction: now,
      interactionCount: 1,
      commonTopics: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getContactByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});
