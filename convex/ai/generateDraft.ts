"use node";

/**
 * Convex Action: Generate Smart Draft
 *
 * Uses AI to generate context-aware email drafts based on
 * contact history and relationship patterns.
 */

import { action, internalAction } from '../_generated/server';
import { v } from 'convex/values';
import { api, internal } from '../_generated/api';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini lazily
let geminiClient: GoogleGenerativeAI | null = null;

function getGemini(): GoogleGenerativeAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
  }
  return geminiClient;
}

export const generateSmartDraft = action({
  args: {
    emailId: v.id('emails'),
    userInstructions: v.optional(v.string()),
    preferredTone: v.optional(v.union(v.literal('formal'), v.literal('neutral'), v.literal('casual'))),
  },
  handler: async (ctx, args) => {
    // Get the original email
    const email = await ctx.runQuery(api.emails.getEmail, { id: args.emailId });
    if (!email) {
      throw new Error('Email not found');
    }

    // Get contact history
    const contactEmails = await ctx.runQuery(api.emails.getEmailsByContact, {
      email: email.from,
      limit: 20,
    });

    // Analyze contact for context
    const contactProfile = analyzeContact(email.from, contactEmails);

    // Build the prompt
    const tone = args.preferredTone || contactProfile.suggestedTone;
    const systemPrompt = buildSystemPrompt(contactProfile, tone);
    const userPrompt = buildUserPrompt(email, args.userInstructions);

    try {
      // Generate with Gemini
      const gemini = getGemini();
      const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: userPrompt },
      ]);

      const generatedBody = cleanResponse(result.response.text());

      // Store the draft
      const draftId = await ctx.runMutation(api.drafts.createDraft, {
        emailId: args.emailId,
        subject: `Re: ${email.subject}`,
        body: generatedBody,
      });

      return {
        success: true,
        draftId,
        subject: `Re: ${email.subject}`,
        body: generatedBody,
        metadata: {
          tone,
          usedContext: contactProfile.interactionCount > 0,
          relationshipStrength: contactProfile.relationshipStrength,
        },
      };
    } catch (error) {
      console.error('Draft generation failed:', error);
      throw new Error('Failed to generate draft');
    }
  },
});

// Helper: Analyze contact from email history
function analyzeContact(
  fromEmail: string,
  emails: Array<{ from: string; body: string; date: number }>
) {
  const interactionCount = emails.length;

  // Calculate relationship strength (0-1)
  let strength = 0;
  if (interactionCount > 0) {
    const recency = emails[0]
      ? (Date.now() - emails[0].date) / (1000 * 60 * 60 * 24 * 30)
      : 30;
    strength = Math.min(
      1,
      (interactionCount / 20) * 0.5 + (1 - Math.min(recency, 1)) * 0.5
    );
  }

  // Detect tone from history
  let formalCount = 0;
  let casualCount = 0;
  for (const email of emails.slice(0, 10)) {
    const body = email.body.toLowerCase();
    if (/dear|sincerely|regards|please find/i.test(body)) formalCount++;
    if (/hey|hi!|thanks!|cheers/i.test(body)) casualCount++;
  }

  const suggestedTone =
    formalCount > casualCount * 1.5
      ? 'formal'
      : casualCount > formalCount * 1.5
        ? 'casual'
        : 'neutral';

  return {
    email: fromEmail,
    interactionCount,
    relationshipStrength: strength,
    suggestedTone: suggestedTone as 'formal' | 'neutral' | 'casual',
  };
}

// Helper: Build system prompt
function buildSystemPrompt(
  profile: {
    interactionCount: number;
    suggestedTone: string;
    relationshipStrength: number;
  },
  tone: string
) {
  const parts = [
    'You are an AI email assistant helping to draft professional email responses.',
    'Generate a helpful, appropriate response to the email below.',
  ];

  switch (tone) {
    case 'formal':
      parts.push(
        'Use a formal, professional tone. Address the recipient appropriately.'
      );
      break;
    case 'casual':
      parts.push('Use a friendly, conversational tone.');
      break;
    default:
      parts.push('Use a balanced, professional but friendly tone.');
  }

  if (profile.interactionCount > 5) {
    parts.push(
      `This is an ongoing relationship (${profile.interactionCount} prior emails). Maintain rapport.`
    );
  } else if (profile.interactionCount === 0) {
    parts.push('This is a new contact. Be clear and introduce context as needed.');
  }

  parts.push('Output ONLY the email body text. Do not include subject lines or metadata.');

  return parts.join('\n');
}

// Helper: Build user prompt
function buildUserPrompt(
  email: { from: string; subject: string; body: string },
  instructions?: string
) {
  const parts = [
    '## Email to respond to:',
    `From: ${email.from}`,
    `Subject: ${email.subject}`,
    `Body:\n${email.body}`,
  ];

  if (instructions) {
    parts.push(`\n## Additional instructions:\n${instructions}`);
  }

  parts.push('\n## Generate response:');
  return parts.join('\n');
}

// Helper: Clean generated response
function cleanResponse(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(
    /^(?:here'?s? (?:a|the|your) )?(?:draft )?(?:response|reply|email):?\s*/i,
    ''
  );
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/^Subject:.*?\n/i, '');
  return cleaned.trim();
}
