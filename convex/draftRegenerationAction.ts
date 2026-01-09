"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import OpenAI from "openai";

/**
 * Regenerate a draft with user feedback
 * Creates a new version of the draft with incremented version number
 */
export const regenerateDraft = action({
  args: {
    draftId: v.id("drafts"),
    userFeedback: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the original draft
    const originalDraft = await ctx.runQuery(api.drafts.getDraft, {
      draftId: args.draftId,
    });
    if (!originalDraft) {
      throw new Error("Draft not found");
    }

    // Get the email to provide context
    const email = await ctx.runQuery(api.emails.getEmail, {
      emailId: originalDraft.emailId,
    });
    if (!email) {
      throw new Error("Email not found");
    }

    // Prepare OpenAI prompt with user feedback
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `You are an email draft generator. The user has provided feedback on their draft email.

Original Email:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

Current Draft:
Subject: ${originalDraft.subject}
Body: ${originalDraft.body}

User Feedback: ${args.userFeedback}

Please regenerate the email draft based on this feedback. Return only valid JSON with subject and body fields.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an email draft generator. Generate professional, contextually appropriate email replies. Return only valid JSON with subject and body fields.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || "{}";
    const result = JSON.parse(content);

    // Get current version number
    const currentVersion = (originalDraft.metadata?.version as number) || 1;
    const newVersion = currentVersion + 1;

    // Create new draft version
    const newDraftId = await ctx.runMutation(api.draftRegeneration.createDraftVersion, {
      emailId: originalDraft.emailId,
      subject: result.subject || originalDraft.subject,
      body: result.body || originalDraft.body,
      userFeedback: args.userFeedback,
      version: newVersion,
    });

    return newDraftId;
  },
});
