/**
 * Contact Enrichment - Build rich contact profiles from email history
 *
 * Analyzes email interactions to understand relationships and suggest
 * appropriate tone for AI-generated responses.
 */

export interface ContactProfile {
  email: string;
  name: string;
  company?: string;
  interactionCount: number;
  lastInteraction: number | null;
  relationshipStrength: number; // 0-1
  suggestedTone: ToneProfile;
  commonTopics: string[];
  responsePatterns: ResponsePattern;
}

export interface ToneProfile {
  formality: 'formal' | 'neutral' | 'casual';
  enthusiasm: 'reserved' | 'neutral' | 'enthusiastic';
  verbosity: 'brief' | 'moderate' | 'detailed';
  commonTopics: string[];
}

export interface ResponsePattern {
  avgResponseTime: number; // hours
  typicalLength: 'short' | 'medium' | 'long';
  prefersThreads: boolean;
}

export interface RelationshipContext {
  totalEmails: number;
  lastInteraction: number;
  responseRate: number;
  avgResponseTime: number;
}

interface EmailData {
  from: string;
  subject: string;
  body: string;
  date: number;
}

/**
 * Extract contact info from email address string
 */
export function extractContactFromEmail(emailString: string): {
  name: string;
  email: string;
  company?: string;
} {
  // Handle "Name <email>" format
  const standardMatch = emailString.match(/^"?([^"<]+)"?\s*<([^>]+)>$/);
  if (standardMatch) {
    const name = standardMatch[1].trim();
    const email = standardMatch[2].trim();
    const company = email.split('@')[1];
    return { name, email, company };
  }

  // Handle email-only format
  const emailOnly = emailString.trim();
  if (emailOnly.includes('@')) {
    const [localPart, domain] = emailOnly.split('@');
    return {
      name: localPart,
      email: emailOnly,
      company: domain,
    };
  }

  return { name: emailString, email: emailString };
}

/**
 * Calculate relationship strength based on interaction patterns
 */
export function calculateRelationshipStrength(
  interactions: RelationshipContext
): number {
  // Factors: frequency, recency, response rate, response time

  // Frequency score (0-0.3)
  const frequencyScore = Math.min(interactions.totalEmails / 100, 1) * 0.3;

  // Recency score (0-0.3) - decays over time
  const daysSinceLastInteraction =
    (Date.now() - interactions.lastInteraction) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 1 - daysSinceLastInteraction / 90) * 0.3;

  // Response rate score (0-0.2)
  const responseScore = interactions.responseRate * 0.2;

  // Response time score (0-0.2) - faster is better
  const responseTimeScore =
    Math.max(0, 1 - interactions.avgResponseTime / 48) * 0.2;

  return frequencyScore + recencyScore + responseScore + responseTimeScore;
}

/**
 * Infer appropriate tone from email history
 */
export function inferToneFromHistory(
  emails: Array<{ subject: string; body: string }>
): ToneProfile {
  if (emails.length === 0) {
    return {
      formality: 'neutral',
      enthusiasm: 'neutral',
      verbosity: 'moderate',
      commonTopics: [],
    };
  }

  // Analyze formality
  const formalIndicators = [
    /dear\s+(mr|mrs|ms|dr|professor)/i,
    /sincerely|regards|respectfully/i,
    /please find attached/i,
    /i would like to/i,
    /i am writing to/i,
  ];

  const casualIndicators = [
    /\bhey\b|\bhi\b|\bhello\b/i,
    /thanks!|great!|awesome!/i,
    /\blol\b|\bhaha\b/i,
    /see you|talk soon|cheers/i,
  ];

  let formalCount = 0;
  let casualCount = 0;
  let totalLength = 0;
  const topicWords: Record<string, number> = {};

  for (const email of emails) {
    const text = `${email.subject} ${email.body}`.toLowerCase();
    totalLength += email.body.length;

    // Check formality
    for (const pattern of formalIndicators) {
      if (pattern.test(text)) formalCount++;
    }
    for (const pattern of casualIndicators) {
      if (pattern.test(text)) casualCount++;
    }

    // Extract topic words (simple approach)
    const words = text
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4);
    for (const word of words) {
      topicWords[word] = (topicWords[word] || 0) + 1;
    }
  }

  // Determine formality
  let formality: 'formal' | 'neutral' | 'casual' = 'neutral';
  if (formalCount > casualCount * 1.5) {
    formality = 'formal';
  } else if (casualCount > formalCount * 1.5) {
    formality = 'casual';
  }

  // Determine verbosity
  const avgLength = totalLength / emails.length;
  let verbosity: 'brief' | 'moderate' | 'detailed' = 'moderate';
  if (avgLength < 100) verbosity = 'brief';
  else if (avgLength > 500) verbosity = 'detailed';

  // Get common topics
  const commonTopics = Object.entries(topicWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .filter(([_, count]) => count >= 2)
    .map(([word]) => word);

  return {
    formality,
    enthusiasm: 'neutral',
    verbosity,
    commonTopics,
  };
}

/**
 * Build complete contact profile from email history
 */
export async function enrichContactContext(
  email: string,
  emails: EmailData[]
): Promise<ContactProfile> {
  // Extract basic contact info
  const { name, company } = extractContactFromEmail(email);

  // Filter to emails from this contact
  const contactEmails = emails.filter(
    e => e.from.toLowerCase().includes(email.toLowerCase())
  );

  // If no interaction history, return minimal profile
  if (contactEmails.length === 0) {
    return {
      email,
      name,
      company,
      interactionCount: 0,
      lastInteraction: null,
      relationshipStrength: 0,
      suggestedTone: {
        formality: 'neutral',
        enthusiasm: 'neutral',
        verbosity: 'moderate',
        commonTopics: [],
      },
      commonTopics: [],
      responsePatterns: {
        avgResponseTime: 24,
        typicalLength: 'medium',
        prefersThreads: true,
      },
    };
  }

  // Sort by date
  const sortedEmails = [...contactEmails].sort((a, b) => b.date - a.date);

  // Calculate interaction stats
  const interactionCount = sortedEmails.length;
  const lastInteraction = sortedEmails[0].date;

  // Calculate relationship strength
  const relationshipContext: RelationshipContext = {
    totalEmails: interactionCount,
    lastInteraction,
    responseRate: 0.7, // Default, would need reply tracking
    avgResponseTime: 12, // Default
  };
  const relationshipStrength = calculateRelationshipStrength(relationshipContext);

  // Infer tone
  const suggestedTone = inferToneFromHistory(
    contactEmails.map(e => ({ subject: e.subject, body: e.body }))
  );

  // Calculate response patterns
  const avgBodyLength =
    contactEmails.reduce((sum, e) => sum + e.body.length, 0) / contactEmails.length;
  let typicalLength: 'short' | 'medium' | 'long' = 'medium';
  if (avgBodyLength < 100) typicalLength = 'short';
  else if (avgBodyLength > 500) typicalLength = 'long';

  return {
    email,
    name,
    company,
    interactionCount,
    lastInteraction,
    relationshipStrength,
    suggestedTone,
    commonTopics: suggestedTone.commonTopics,
    responsePatterns: {
      avgResponseTime: 12,
      typicalLength,
      prefersThreads: true,
    },
  };
}

/**
 * Generate AI context prompt from contact profile
 */
export function generateContextPrompt(profile: ContactProfile): string {
  const parts: string[] = [];

  // Relationship context
  if (profile.interactionCount > 0) {
    parts.push(
      `This is an ongoing conversation with ${profile.name || profile.email}.`
    );
    parts.push(
      `You have exchanged ${profile.interactionCount} emails with them.`
    );

    if (profile.relationshipStrength > 0.7) {
      parts.push('This is a frequent correspondent - maintain rapport.');
    } else if (profile.relationshipStrength < 0.3) {
      parts.push('Limited prior interaction - be clear and professional.');
    }
  } else {
    parts.push(`This is a new contact: ${profile.name || profile.email}.`);
    parts.push('No prior email history - introduce context clearly.');
  }

  // Tone guidance
  if (profile.suggestedTone.formality === 'formal') {
    parts.push('Match their formal tone - use professional language.');
  } else if (profile.suggestedTone.formality === 'casual') {
    parts.push('Match their casual tone - be friendly and conversational.');
  }

  if (profile.suggestedTone.verbosity === 'brief') {
    parts.push('They prefer brief emails - keep the response concise.');
  } else if (profile.suggestedTone.verbosity === 'detailed') {
    parts.push('They write detailed emails - include relevant context.');
  }

  // Topics
  if (profile.commonTopics.length > 0) {
    parts.push(
      `Common topics: ${profile.commonTopics.slice(0, 3).join(', ')}.`
    );
  }

  return parts.join(' ');
}
