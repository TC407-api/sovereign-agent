/**
 * Smart Draft Generator - AI-powered email response generation
 *
 * Uses contact context and relationship history to generate
 * personalized, appropriate email responses.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ContactProfile, ToneProfile } from './contact-enrichment';
import { generateContextPrompt } from './contact-enrichment';

export interface DraftGenerationOptions {
  preferredLength?: 'short' | 'medium' | 'long';
  toneOverride?: 'formal' | 'neutral' | 'casual';
  includeGreeting?: boolean;
  includeSignature?: boolean;
}

export interface GeneratedDraft {
  subject: string;
  body: string;
  confidence: number;
  toneUsed: 'formal' | 'neutral' | 'casual';
  metadata: {
    usedContactContext: boolean;
    relationshipStrength: number;
    generationTime: number;
    model: string;
  };
}

interface EmailData {
  from: string;
  subject: string;
  body: string;
  date: number;
}

// Initialize Gemini client lazily
let geminiClient: GoogleGenerativeAI | null = null;

function getGemini(): GoogleGenerativeAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
  }
  return geminiClient;
}

/**
 * Generate a smart draft response using AI and contact context
 */
export async function generateSmartDraft({
  originalEmail,
  contactProfile,
  userInstructions,
  options = {},
}: {
  originalEmail: EmailData;
  contactProfile: ContactProfile;
  userInstructions?: string;
  options?: DraftGenerationOptions;
}): Promise<GeneratedDraft> {
  const startTime = Date.now();

  // Determine tone to use
  const toneToUse =
    options.toneOverride ||
    contactProfile.suggestedTone?.formality ||
    'neutral';

  // Build the system prompt
  const systemPrompt = buildSystemPrompt(contactProfile, toneToUse, options);

  // Build the user prompt
  const userPrompt = buildUserPrompt(
    originalEmail,
    contactProfile,
    userInstructions
  );

  try {
    const gemini = getGemini();
    const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt },
    ]);

    const generatedText = result.response.text();

    // Parse the response
    const body = cleanGeneratedResponse(generatedText);

    // Generate subject line
    const subject = generateSubjectLine(originalEmail.subject);

    // Calculate confidence based on context quality
    const confidence = calculateConfidence(contactProfile);

    return {
      subject,
      body,
      confidence,
      toneUsed: toneToUse as 'formal' | 'neutral' | 'casual',
      metadata: {
        usedContactContext: contactProfile.interactionCount > 0,
        relationshipStrength: contactProfile.relationshipStrength,
        generationTime: Date.now() - startTime,
        model: 'gemini-2.0-flash',
      },
    };
  } catch (error) {
    console.error('Draft generation failed:', error);

    // Return a fallback draft
    return {
      subject: `Re: ${originalEmail.subject}`,
      body: 'Thank you for your email. I will review and get back to you shortly.',
      confidence: 0.3,
      toneUsed: toneToUse as 'formal' | 'neutral' | 'casual',
      metadata: {
        usedContactContext: false,
        relationshipStrength: contactProfile.relationshipStrength,
        generationTime: Date.now() - startTime,
        model: 'fallback',
      },
    };
  }
}

/**
 * Build the system prompt for the AI
 */
function buildSystemPrompt(
  profile: ContactProfile,
  tone: string,
  options: DraftGenerationOptions
): string {
  const parts: string[] = [];

  parts.push(
    'You are an AI email assistant helping to draft professional email responses.'
  );
  parts.push('Generate a helpful, appropriate response to the email below.');

  // Tone instructions
  switch (tone) {
    case 'formal':
      parts.push(
        'Use a formal, professional tone. Address the recipient appropriately.'
      );
      parts.push('Avoid contractions and casual language.');
      break;
    case 'casual':
      parts.push('Use a friendly, conversational tone.');
      parts.push('Feel free to use contractions and be personable.');
      break;
    default:
      parts.push('Use a balanced, professional but friendly tone.');
  }

  // Length instructions
  switch (options.preferredLength) {
    case 'short':
      parts.push('Keep the response brief - 2-3 sentences maximum.');
      break;
    case 'long':
      parts.push('Provide a detailed response with full context.');
      break;
    default:
      parts.push('Write a moderate-length response - around 3-5 sentences.');
  }

  // Add contact context if available
  if (profile.interactionCount > 0) {
    parts.push(generateContextPrompt(profile));
  }

  parts.push('IMPORTANT: Only output the email body text. Do not include subject lines, salutations, or metadata.');

  return parts.join('\n');
}

/**
 * Build the user prompt with the email to respond to
 */
function buildUserPrompt(
  email: EmailData,
  profile: ContactProfile,
  userInstructions?: string
): string {
  const parts: string[] = [];

  parts.push('## Email to respond to:');
  parts.push(`From: ${email.from}`);
  parts.push(`Subject: ${email.subject}`);
  parts.push(`Body:\n${email.body}`);

  if (userInstructions) {
    parts.push(`\n## Additional instructions:\n${userInstructions}`);
  }

  parts.push('\n## Generate response:');

  return parts.join('\n');
}

/**
 * Clean the generated response
 */
function cleanGeneratedResponse(response: string): string {
  let cleaned = response.trim();

  // Remove common AI preambles
  const preambles = [
    /^(?:here'?s? (?:a|the|your) )?(?:draft )?(?:response|reply|email):?\s*/i,
    /^(?:sure,? )?(?:here'?s? (?:a|the) )?(?:suggested )?(?:response|reply):?\s*/i,
  ];

  for (const pattern of preambles) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Remove markdown code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Remove subject line if accidentally included
  cleaned = cleaned.replace(/^Subject:.*?\n/i, '');

  return cleaned.trim();
}

/**
 * Generate a subject line for the reply
 */
function generateSubjectLine(originalSubject: string): string {
  // Check if already a reply
  if (/^re:/i.test(originalSubject)) {
    return originalSubject;
  }
  return `Re: ${originalSubject}`;
}

/**
 * Calculate confidence score based on available context
 */
function calculateConfidence(profile: ContactProfile): number {
  let confidence = 0.5; // Base confidence

  // More interactions = higher confidence
  if (profile.interactionCount > 10) {
    confidence += 0.2;
  } else if (profile.interactionCount > 3) {
    confidence += 0.1;
  }

  // Strong relationship = higher confidence
  if (profile.relationshipStrength > 0.7) {
    confidence += 0.15;
  } else if (profile.relationshipStrength > 0.4) {
    confidence += 0.08;
  }

  // Known tone = higher confidence
  if (profile.suggestedTone.formality !== 'neutral') {
    confidence += 0.05;
  }

  // Cap at 0.95
  return Math.min(confidence, 0.95);
}

/**
 * Generate multiple draft variations
 */
export async function generateDraftVariations(
  params: {
    originalEmail: EmailData;
    contactProfile: ContactProfile;
    userInstructions?: string;
  },
  count: number = 3
): Promise<GeneratedDraft[]> {
  const tones: Array<'formal' | 'neutral' | 'casual'> = [
    'formal',
    'neutral',
    'casual',
  ];

  const drafts = await Promise.all(
    tones.slice(0, count).map((tone) =>
      generateSmartDraft({
        ...params,
        options: { toneOverride: tone },
      })
    )
  );

  return drafts;
}
