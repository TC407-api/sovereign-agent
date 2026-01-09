/**
 * AI Command Parser - Natural Language Interface for Email Management
 *
 * Parses natural language commands and extracts intent + entities
 * for the AI assistant to act upon.
 */

export type CommandIntent =
  | 'DRAFT_REPLY'
  | 'SUMMARIZE_INBOX'
  | 'FILTER_EMAILS'
  | 'SEARCH_EMAILS'
  | 'SCHEDULE_FOLLOWUP'
  | 'CALENDAR_QUERY'
  | 'BATCH_ARCHIVE'
  | 'BATCH_READ'
  | 'BATCH_DELETE'
  | 'SCHEDULE_MEETING'
  | 'FIND_FREE_TIME'
  | 'UNKNOWN';

export interface CommandEntities {
  contact?: string;
  email?: string;
  timeframe?: string;
  priority?: string;
  subject?: string;
  filter?: string;
  date?: string;
}

export interface CommandResult {
  intent: CommandIntent;
  entities: CommandEntities;
  confidence: number;
  rawCommand: string;
  suggestions: string[];
}

// Intent patterns with associated regex and entity extractors
interface IntentPattern {
  intent: CommandIntent;
  patterns: RegExp[];
  entityExtractors: EntityExtractor[];
  baseConfidence: number;
}

type EntityExtractor = (command: string, entities: CommandEntities) => void;

// Entity extractors
const extractContact: EntityExtractor = (command, entities) => {
  // Match "from [Name]" at end of sentence (most specific)
  const fromEndMatch = command.match(/from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*$/i);
  if (fromEndMatch) {
    entities.contact = fromEndMatch[1];
    return;
  }

  // Match "from [Name]" anywhere
  const fromMatch = command.match(/from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (fromMatch) {
    entities.contact = fromMatch[1];
    return;
  }

  // Match "to [Name]" for scheduling
  const toMatch = command.match(/(?:to|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (toMatch) {
    entities.contact = toMatch[1];
    return;
  }
};

const extractEmail: EntityExtractor = (command, entities) => {
  const emailMatch = command.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    entities.email = emailMatch[1];
    // Also set contact if we found an email
    if (!entities.contact) {
      entities.contact = emailMatch[1];
    }
  }
};

const extractTimeframe: EntityExtractor = (command, entities) => {
  const timePatterns = [
    /\b(today)\b/i,
    /\b(tomorrow)\b/i,
    /\b(yesterday)\b/i,
    /\b(this week)\b/i,
    /\b(last week)\b/i,
    /\b(this month)\b/i,
    /\b(last month)\b/i,
    /\b(next week)\b/i,
    /\b(next month)\b/i,
  ];

  for (const pattern of timePatterns) {
    const match = command.match(pattern);
    if (match) {
      entities.timeframe = match[1].toLowerCase();
      return;
    }
  }
};

const extractPriority: EntityExtractor = (command, entities) => {
  const priorityPatterns = [
    { pattern: /\b(urgent)\b/i, value: 'urgent' },
    { pattern: /\b(high)\s*(?:priority)?\b/i, value: 'high' },
    { pattern: /\b(medium)\s*(?:priority)?\b/i, value: 'medium' },
    { pattern: /\b(low)\s*(?:priority)?\b/i, value: 'low' },
    { pattern: /\b(important)\b/i, value: 'high' },
  ];

  for (const { pattern, value } of priorityPatterns) {
    if (pattern.test(command)) {
      entities.priority = value;
      return;
    }
  }
};

const extractSubject: EntityExtractor = (command, entities) => {
  const subjectMatch = command.match(/(?:about|regarding|subject|re:?)\s+(.+?)(?:\s+from|\s+to|$)/i);
  if (subjectMatch) {
    entities.subject = subjectMatch[1].trim();
  }
};

const extractFilter: EntityExtractor = (command, entities) => {
  const filterPatterns = [
    { pattern: /\b(newsletter)s?\b/i, value: 'newsletter' },
    { pattern: /\b(unread)\b/i, value: 'unread' },
    { pattern: /\b(starred)\b/i, value: 'starred' },
    { pattern: /\b(archived)\b/i, value: 'archived' },
    { pattern: /\b(promotions?)\b/i, value: 'promotion' },
    { pattern: /\b(spam)\b/i, value: 'spam' },
  ];

  for (const { pattern, value } of filterPatterns) {
    if (pattern.test(command)) {
      entities.filter = value;
      return;
    }
  }
};

// All entity extractors
const allExtractors: EntityExtractor[] = [
  extractContact,
  extractEmail,
  extractTimeframe,
  extractPriority,
  extractSubject,
  extractFilter,
];

// Intent patterns
const intentPatterns: IntentPattern[] = [
  {
    intent: 'DRAFT_REPLY',
    patterns: [
      /\b(?:draft|write|compose)\s+(?:a\s+)?(?:reply|response)\b/i,
      /\breply\s+to\b/i,
      /\brespond\s+to\b/i,
    ],
    entityExtractors: [extractContact, extractEmail],
    baseConfidence: 0.9,
  },
  {
    intent: 'SUMMARIZE_INBOX',
    patterns: [
      /\bsummar(?:ize|y)\s+(?:my\s+)?inbox\b/i,
      /\binbox\s+summar(?:ize|y)\b/i,
      /\bgive\s+me\s+(?:a\s+)?summary\b/i,
      /\bwhat(?:'s| is)\s+(?:in\s+)?(?:my\s+)?inbox\b/i,
    ],
    entityExtractors: [extractTimeframe],
    baseConfidence: 0.95,
  },
  {
    intent: 'FILTER_EMAILS',
    patterns: [
      /\bshow\s+(?:me\s+)?(?:all\s+)?(?:the\s+)?(?:urgent|high|low|important)\b/i,
      /\b(?:urgent|high|low|important)\s+emails?\b/i,
      /\bfilter\s+(?:by\s+)?(?:urgent|high|low|important)\b/i,
    ],
    entityExtractors: [extractPriority, extractTimeframe],
    baseConfidence: 0.85,
  },
  {
    intent: 'SEARCH_EMAILS',
    patterns: [
      /\bfind\s+(?:all\s+)?(?:the\s+)?emails?\b/i,
      /\bsearch\s+(?:for\s+)?(?:emails?\s+)?(?:from|about|regarding)\b/i,
      /\blook\s+(?:for|up)\s+(?:emails?\s+)?(?:from|about)\b/i,
      /\bshow\s+(?:me\s+)?(?:emails?\s+)?from\b/i,
    ],
    entityExtractors: [extractContact, extractEmail, extractSubject, extractTimeframe],
    baseConfidence: 0.85,
  },
  {
    intent: 'SCHEDULE_FOLLOWUP',
    patterns: [
      /\bschedule\s+(?:a\s+)?follow[\s-]?up\b/i,
      /\bremind\s+me\s+to\s+follow[\s-]?up\b/i,
      /\bset\s+(?:a\s+)?reminder\b/i,
    ],
    entityExtractors: [extractContact, extractTimeframe],
    baseConfidence: 0.85,
  },
  {
    intent: 'CALENDAR_QUERY',
    patterns: [
      /\bwhat(?:'s| is)\s+(?:on\s+)?(?:my\s+)?calendar\b/i,
      /\bmy\s+schedule\b/i,
      /\bshow\s+(?:me\s+)?(?:my\s+)?calendar\b/i,
      /\bwhat\s+(?:do\s+)?(?:i\s+)?have\s+(?:today|tomorrow|this week)\b/i,
      /\bany\s+meetings?\b/i,
    ],
    entityExtractors: [extractTimeframe],
    baseConfidence: 0.9,
  },
  {
    intent: 'BATCH_ARCHIVE',
    patterns: [
      /\barchive\s+(?:all\s+)?(?:the\s+)?(?:newsletters?|emails?)\b/i,
      /\bmove\s+(?:all\s+)?(?:to\s+)?archive\b/i,
    ],
    entityExtractors: [extractFilter, extractContact],
    baseConfidence: 0.85,
  },
  {
    intent: 'BATCH_READ',
    patterns: [
      /\bmark\s+(?:all\s+)?(?:as\s+)?read\b/i,
      /\bread\s+all\b/i,
    ],
    entityExtractors: [extractFilter, extractContact],
    baseConfidence: 0.85,
  },
  {
    intent: 'SCHEDULE_MEETING',
    patterns: [
      /\bschedule\s+(?:a\s+)?meeting\b/i,
      /\bset\s+up\s+(?:a\s+)?(?:call|meeting)\b/i,
      /\bbook\s+(?:a\s+)?(?:time|meeting|call)\b/i,
    ],
    entityExtractors: [extractContact, extractTimeframe],
    baseConfidence: 0.9,
  },
  {
    intent: 'FIND_FREE_TIME',
    patterns: [
      /\bfind\s+(?:some\s+)?free\s+time\b/i,
      /\bwhen\s+am\s+i\s+(?:free|available)\b/i,
      /\bopen\s+slots?\b/i,
      /\bavailable\s+times?\b/i,
    ],
    entityExtractors: [extractTimeframe],
    baseConfidence: 0.85,
  },
];

// Common command suggestions for fuzzy matching
const commonCommands = [
  'summarize my inbox',
  'draft a reply',
  'show urgent emails',
  'find emails from',
  'schedule a follow-up',
  'what is on my calendar today',
  'archive all newsletters',
  'mark all as read',
  'schedule a meeting',
  'find free time',
];

// Levenshtein distance for typo detection
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Generate suggestions based on partial matches or typos
function generateSuggestions(command: string): string[] {
  const normalizedCommand = command.toLowerCase().trim();
  const suggestions: Array<{ command: string; score: number }> = [];

  for (const commonCmd of commonCommands) {
    // Check if command is a prefix
    if (commonCmd.startsWith(normalizedCommand)) {
      suggestions.push({ command: commonCmd, score: 0 });
      continue;
    }

    // Check if common command contains the input word
    if (commonCmd.includes(normalizedCommand)) {
      suggestions.push({ command: commonCmd, score: 1 });
      continue;
    }

    // Check Levenshtein distance for first few words
    const cmdWords = normalizedCommand.split(/\s+/).slice(0, 3).join(' ');
    const commonWords = commonCmd.split(/\s+/).slice(0, 3).join(' ');
    const distance = levenshtein(cmdWords, commonWords);

    // More lenient threshold for typos
    if (distance <= 4) {
      suggestions.push({ command: commonCmd, score: distance });
    }
  }

  // Sort by score and return top suggestions
  return suggestions
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(s => s.command);
}

/**
 * Parse a natural language command and extract intent + entities
 */
export async function parseCommand(command: string): Promise<CommandResult> {
  const normalizedCommand = command.toLowerCase().trim();
  const entities: CommandEntities = {};

  // Try to match each intent pattern
  for (const intentPattern of intentPatterns) {
    for (const pattern of intentPattern.patterns) {
      if (pattern.test(normalizedCommand)) {
        // Extract entities using the intent's extractors
        for (const extractor of intentPattern.entityExtractors) {
          extractor(command, entities);
        }

        // Also run all extractors to catch additional entities
        for (const extractor of allExtractors) {
          if (!intentPattern.entityExtractors.includes(extractor)) {
            extractor(command, entities);
          }
        }

        return {
          intent: intentPattern.intent,
          entities,
          confidence: intentPattern.baseConfidence,
          rawCommand: command,
          suggestions: [],
        };
      }
    }
  }

  // No match - try to extract any entities and return UNKNOWN
  for (const extractor of allExtractors) {
    extractor(command, entities);
  }

  // Generate suggestions for unknown commands
  const suggestions = generateSuggestions(normalizedCommand);

  // Calculate confidence based on how many entities we found
  const entityCount = Object.keys(entities).length;
  const ambiguousConfidence = Math.min(0.3 + entityCount * 0.1, 0.6);

  return {
    intent: 'UNKNOWN',
    entities,
    confidence: ambiguousConfidence,
    rawCommand: command,
    suggestions,
  };
}

/**
 * Check if a command is asking for help
 */
export function isHelpCommand(command: string): boolean {
  return /\b(?:help|how|what can|commands?)\b/i.test(command);
}

/**
 * Get available command examples
 */
export function getCommandExamples(): Array<{ command: string; description: string }> {
  return [
    { command: 'Draft a reply to John', description: 'Create an AI-generated reply' },
    { command: 'Summarize my inbox', description: 'Get a summary of unread emails' },
    { command: 'Show urgent emails', description: 'Filter emails by priority' },
    { command: 'Find emails from Sarah', description: 'Search emails by sender' },
    { command: 'Schedule a follow-up', description: 'Set a reminder to follow up' },
    { command: 'What is on my calendar today?', description: 'View today\'s schedule' },
    { command: 'Archive all newsletters', description: 'Bulk archive emails' },
    { command: 'Schedule a meeting with Mike', description: 'Book a calendar event' },
    { command: 'Find free time this week', description: 'Find available slots' },
  ];
}
