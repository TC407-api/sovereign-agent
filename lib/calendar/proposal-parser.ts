import type { MeetingProposal } from "../types/calendar";

interface EmailInput {
  subject: string;
  body: string;
}

// Keywords that indicate a meeting request
const MEETING_KEYWORDS = [
  "meet",
  "meeting",
  "sync",
  "call",
  "discuss",
  "schedule",
  "catch up",
  "chat",
  "talk",
  "conference",
  "huddle",
];

// Keywords that indicate it's NOT a meeting request
const NON_MEETING_KEYWORDS = [
  "invoice",
  "receipt",
  "confirmation",
  "newsletter",
  "unsubscribe",
  "automated",
  "do-not-reply",
];

/**
 * Parses email content to detect if it contains a meeting proposal
 * Returns null if no meeting is detected
 */
export function parseMeetingProposal(email: EmailInput): Partial<MeetingProposal> | null {
  const combinedText = `${email.subject} ${email.body}`.toLowerCase();

  // Check for non-meeting keywords first
  for (const keyword of NON_MEETING_KEYWORDS) {
    if (combinedText.includes(keyword)) {
      return null;
    }
  }

  // Check for meeting keywords
  const hasMeetingKeyword = MEETING_KEYWORDS.some((keyword) =>
    combinedText.includes(keyword)
  );

  if (!hasMeetingKeyword) {
    return null;
  }

  // Extract a title from the subject
  const title = cleanSubject(email.subject);

  return {
    title,
    attendees: [],
  };
}

/**
 * Clean up the subject line to use as a meeting title
 */
function cleanSubject(subject: string): string {
  return subject
    .replace(/^(Re:|Fwd:|FW:)\s*/gi, "")
    .trim();
}

/**
 * Extract a date mention from text (simplified implementation)
 * A production version would use chrono-node or similar
 */
export function extractDateMention(text: string): string | null {
  // Common date patterns
  const patterns = [
    /(?:on\s+)?(\w+\s+\d{1,2}(?:st|nd|rd|th)?)/i, // "January 15th"
    /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i, // "1/15" or "1/15/2026"
    /(tomorrow|today|next\s+\w+)/i, // "tomorrow", "next Monday"
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract a time mention from text (simplified implementation)
 */
export function extractTimeMention(text: string): string | null {
  const patterns = [
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i, // "2pm", "2:30 PM"
    /(\d{1,2}:\d{2})/i, // "14:30"
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
