// NL Command Parser - requires Anthropic SDK when enabled
// This is a placeholder implementation for testing

export interface ParsedCommand {
  intent: string;
  entities: Record<string, string>;
  confidence: number;
  rawInput: string;
}

// Simple rule-based parser for common commands (fallback without AI)
export async function parseCommand(raw: string): Promise<ParsedCommand> {
  const input = raw.toLowerCase().trim();

  // Schedule meeting pattern
  if (input.includes('schedule') || input.includes('meeting')) {
    const personMatch = input.match(/with\s+(\w+)/i);
    const timeMatch = input.match(/at\s+(\d+(?:am|pm)?)/i);
    const dateMatch = input.match(/(tomorrow|today|next week)/i);

    return {
      intent: 'schedule_meeting',
      entities: {
        ...(personMatch && { person: personMatch[1] }),
        ...(timeMatch && { time: timeMatch[1] }),
        ...(dateMatch && { date: dateMatch[1] }),
      },
      confidence: 0.85,
      rawInput: raw,
    };
  }

  // Find email pattern
  if (input.includes('find') || input.includes('search')) {
    const personMatch = input.match(/from\s+(\w+)/i);
    const subjectMatch = input.match(/about\s+(.+?)(?:\s+from|$)/i);

    return {
      intent: 'find_email',
      entities: {
        ...(personMatch && { person: personMatch[1] }),
        ...(subjectMatch && { subject: subjectMatch[1] }),
      },
      confidence: 0.90,
      rawInput: raw,
    };
  }

  // Archive pattern
  if (input.includes('archive')) {
    return {
      intent: 'archive',
      entities: {},
      confidence: 0.95,
      rawInput: raw,
    };
  }

  // Unknown
  return {
    intent: 'unknown',
    entities: {},
    confidence: 0.2,
    rawInput: raw,
  };
}
