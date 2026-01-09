/**
 * Content Guardrails - Safety checks for AI-generated email content
 *
 * Detects sensitive information, analyzes tone, and prevents
 * accidental data leakage or inappropriate communication.
 */

export type FlagType = 'PII' | 'CREDENTIAL' | 'CONFIDENTIAL' | 'TONE' | 'EXTERNAL';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface ContentFlag {
  type: FlagType;
  category: string;
  severity: Severity;
  location: { start: number; end: number };
  suggestion: string;
  matchedText?: string;
}

export interface ToneAnalysis {
  hasIssue: boolean;
  issue?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  formality: 'formal' | 'neutral' | 'casual';
  recommendations: string[];
}

export interface ExternalCheck {
  hasExternal: boolean;
  externalRecipients: string[];
  warning?: string;
}

export interface SafetyAnalysis {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  approved: boolean;
  contentFlags: ContentFlag[];
  toneAnalysis: ToneAnalysis;
  externalCheck: ExternalCheck;
  recommendations: string[];
}

// Pattern definitions for sensitive content
const SENSITIVE_PATTERNS = {
  // PII Patterns
  credit_card: {
    pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    type: 'PII' as FlagType,
    category: 'credit_card',
    severity: 'critical' as Severity,
    suggestion: 'Remove credit card number',
  },
  ssn: {
    pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
    type: 'PII' as FlagType,
    category: 'ssn',
    severity: 'critical' as Severity,
    suggestion: 'Remove Social Security Number',
  },
  phone: {
    pattern: /\b(?:\+1[-\s]?)?(?:\(?\d{3}\)?[-\s]?)?\d{3}[-\s]?\d{4}\b/g,
    type: 'PII' as FlagType,
    category: 'phone',
    severity: 'low' as Severity,
    suggestion: 'Consider if phone number is necessary',
  },
  email_address: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    type: 'PII' as FlagType,
    category: 'email',
    severity: 'low' as Severity,
    suggestion: 'Verify email address is appropriate to share',
  },

  // Credential Patterns
  password: {
    pattern: /(?:password|pwd|pass)[\s:=]+['"]?[\w!@#$%^&*]{6,}['"]?/gi,
    type: 'CREDENTIAL' as FlagType,
    category: 'password',
    severity: 'critical' as Severity,
    suggestion: 'Never share passwords in emails - use secure methods',
  },
  api_key: {
    pattern: /(?:api[_-]?key|apikey|secret|token)[\s:=]+['"]?[\w-]{20,}['"]?/gi,
    type: 'CREDENTIAL' as FlagType,
    category: 'api_key',
    severity: 'critical' as Severity,
    suggestion: 'Never share API keys in emails - use secure vault',
  },
  aws_key: {
    pattern: /\b(?:AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16}\b/g,
    type: 'CREDENTIAL' as FlagType,
    category: 'aws_key',
    severity: 'critical' as Severity,
    suggestion: 'AWS access key detected - never share in emails',
  },

  // Confidentiality Markers
  confidential: {
    pattern: /\b(?:confidential|classified|secret|internal[\s-]only|do[\s-]not[\s-]share)\b/gi,
    type: 'CONFIDENTIAL' as FlagType,
    category: 'marker',
    severity: 'medium' as Severity,
    suggestion: 'Content marked as confidential - verify recipients',
  },
};

// Aggressive language patterns
const AGGRESSIVE_PATTERNS = [
  /\b(?:unacceptable|outrageous|ridiculous|incompetent)\b/gi,
  /!{2,}/g, // Multiple exclamation marks
  /\b(?:demand|insist|require immediately)\b/gi,
  /(?:[A-Z]{4,}\s*){2,}/g, // Multiple all-caps words
];

// Casual language patterns
const CASUAL_PATTERNS = [
  /\b(?:yo|bro|dude|lol|lmao|omg|btw|thx|u\b|ur\b|asap)\b/gi,
  /\b(?:gonna|wanna|gotta|kinda|sorta)\b/gi,
];

// Negative sentiment patterns
const NEGATIVE_PATTERNS = [
  /\b(?:disappointed|frustrated|angry|upset|annoyed|terrible|horrible|awful)\b/gi,
  /\b(?:fail|failed|failure|problem|issue|complaint)\b/gi,
];

/**
 * Detect sensitive content in text
 */
export function detectSensitiveContent(text: string): ContentFlag[] {
  const flags: ContentFlag[] = [];

  for (const [key, config] of Object.entries(SENSITIVE_PATTERNS)) {
    const matches = text.matchAll(config.pattern);
    for (const match of matches) {
      // Skip email detection for now (too noisy)
      if (key === 'email_address') continue;

      flags.push({
        type: config.type,
        category: config.category,
        severity: config.severity,
        location: {
          start: match.index || 0,
          end: (match.index || 0) + match[0].length,
        },
        suggestion: config.suggestion,
        matchedText: maskSensitiveText(match[0], config.category),
      });
    }
  }

  return flags;
}

/**
 * Analyze the tone of the content
 */
export function analyzeTone(
  text: string,
  expectedTone?: 'formal' | 'neutral' | 'casual'
): ToneAnalysis {
  const recommendations: string[] = [];

  // Check for aggressive language
  let aggressiveCount = 0;
  for (const pattern of AGGRESSIVE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) aggressiveCount += matches.length;
  }

  const isAggressive = aggressiveCount >= 2;
  if (isAggressive) {
    recommendations.push('Consider softening aggressive language');
  }

  // Check for casual language
  let casualCount = 0;
  for (const pattern of CASUAL_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) casualCount += matches.length;
  }

  const isTooTonal =
    expectedTone === 'formal' && casualCount >= 2;
  if (isTooTonal) {
    recommendations.push('Use more formal language for this context');
  }

  // Check for negative sentiment
  let negativeCount = 0;
  for (const pattern of NEGATIVE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) negativeCount += matches.length;
  }

  // Determine sentiment
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (negativeCount >= 3) sentiment = 'negative';

  // Determine formality
  let formality: 'formal' | 'neutral' | 'casual' = 'neutral';
  if (casualCount >= 3) formality = 'casual';

  // Determine if there's an issue
  let hasIssue = false;
  let issue: string | undefined;

  if (isAggressive) {
    hasIssue = true;
    issue = 'Content may be too aggressive';
  } else if (isTooTonal) {
    hasIssue = true;
    issue = 'Content may be too casual for formal context';
  }

  return {
    hasIssue,
    issue,
    sentiment,
    formality,
    recommendations,
  };
}

/**
 * Check for external recipients
 */
export function checkExternalRecipients(
  recipients: string[],
  internalDomain: string
): ExternalCheck {
  const externalRecipients = recipients.filter(
    (email) => !email.toLowerCase().endsWith(`@${internalDomain.toLowerCase()}`)
  );

  return {
    hasExternal: externalRecipients.length > 0,
    externalRecipients,
    warning:
      externalRecipients.length > 0
        ? `Email will be sent to ${externalRecipients.length} external recipient(s)`
        : undefined,
  };
}

/**
 * Full safety analysis of a draft
 */
export function analyzeDraftSafety(
  draft: { body: string; recipients: string[] },
  internalDomain: string
): SafetyAnalysis {
  // Run all checks
  const contentFlags = detectSensitiveContent(draft.body);
  const toneAnalysis = analyzeTone(draft.body);
  const externalCheck = checkExternalRecipients(draft.recipients, internalDomain);

  // Calculate overall risk
  let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';

  if (contentFlags.some((f) => f.severity === 'critical')) {
    overallRisk = 'critical';
  } else if (
    contentFlags.some((f) => f.severity === 'high') ||
    (contentFlags.some((f) => f.severity === 'medium') && externalCheck.hasExternal)
  ) {
    overallRisk = 'high';
  } else if (
    contentFlags.some((f) => f.severity === 'medium') ||
    (toneAnalysis.hasIssue && externalCheck.hasExternal)
  ) {
    overallRisk = 'medium';
  }

  // Generate recommendations
  const recommendations: string[] = [];

  for (const flag of contentFlags) {
    recommendations.push(flag.suggestion);
  }

  recommendations.push(...toneAnalysis.recommendations);

  if (externalCheck.hasExternal && contentFlags.length > 0) {
    recommendations.push('Review sensitive content before sending to external recipients');
  }

  // Determine if approved
  const approved = overallRisk === 'low';

  return {
    overallRisk,
    approved,
    contentFlags,
    toneAnalysis,
    externalCheck,
    recommendations,
  };
}

/**
 * Mask sensitive text for display
 */
function maskSensitiveText(text: string, category: string): string {
  switch (category) {
    case 'credit_card':
      return text.replace(/\d(?=\d{4})/g, '*');
    case 'ssn':
      return '***-**-' + text.slice(-4);
    case 'password':
    case 'api_key':
    case 'aws_key':
      return text.slice(0, 8) + '...[REDACTED]';
    default:
      return text;
  }
}
