"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const syncEmails = action({
  args: {
    accessToken: v.string(),
    maxEmails: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ synced: number; errors: number }> => {
    const maxEmails = args.maxEmails ?? 500;

    // Dynamically import GmailService to avoid bundling issues
    const { GmailService } = await import("../lib/gmail");
    const gmail = new GmailService(args.accessToken);

    let synced = 0;
    let errors = 0;

    try {
      // Get list of recent emails
      const { emails } = await gmail.listRecentEmails(maxEmails);

      // Sync each email
      for (const emailRef of emails) {
        try {
          const emailDetails = await gmail.getEmailDetails(emailRef.id);

          await ctx.runMutation(internal.syncMutations.internalInsertEmail, {
            gmailId: emailDetails.id,
            threadId: emailDetails.threadId,
            from: emailDetails.from,
            to: emailDetails.to,
            subject: emailDetails.subject,
            body: emailDetails.body,
            snippet: emailDetails.snippet,
            date: emailDetails.date.getTime(),
            receivedAt: Date.now(),
            isRead: false,
            isStarred: false,
            isArchived: false,
          });

          synced++;
        } catch (error) {
          console.error(`Failed to sync email ${emailRef.id}:`, error);
          errors++;
        }
      }
    } catch (error) {
      console.error("Failed to list emails:", error);
      throw new Error("Failed to sync emails from Gmail");
    }

    return { synced, errors };
  },
});
