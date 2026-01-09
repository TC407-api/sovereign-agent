/**
 * AI Intent Classifier - Uses Gemini for ambiguous command classification
 *
 * Falls back to AI when rule-based parsing has low confidence
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CommandResult, CommandIntent, CommandEntities } from './command-parser';

export interface IntentClassification {
  intent: CommandIntent;
  entities: CommandEntities;
  confidence: number;
  rawCommand: string;
  usedAI: boolean;
  reasoning?: string;
}

export interface ActionPlan {
  action: CommandIntent | 'SHOW_HELP';
  params: Record<string, unknown>;
  description: string;
  requiresConfirmation: boolean;
}

// Confidence threshold below which we use AI classification
const AI_CLASSIFICATION_THRESHOLD = 0.7;

// Initialize Gemini client lazily
let geminiClient: GoogleGenerativeAI | null = null;

function getGemini(): GoogleGenerativeAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
  }
  return geminiClient;
}

/**
 * Classify intent using AI when rule-based parsing is uncertain
 */
export async function classifyIntent(command: CommandResult): Promise<IntentClassification> {
  // If confidence is high enough, pass through without AI
  if (command.confidence >= AI_CLASSIFICATION_THRESHOLD && command.intent !== 'UNKNOWN') {
    return {
      intent: command.intent,
      entities: command.entities,
      confidence: command.confidence,
      rawCommand: command.rawCommand,
      usedAI: false,
    };
  }

  // Use AI for low-confidence or unknown intents
  try {
    const gemini = getGemini();
    const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an intent classifier for an email management assistant.
Classify the user's command into one of these intents:
- DRAFT_REPLY: User wants to write/draft a reply to an email
- SUMMARIZE_INBOX: User wants a summary of their inbox
- FILTER_EMAILS: User wants to filter/show emails by criteria
- SEARCH_EMAILS: User wants to search/find specific emails
- SCHEDULE_FOLLOWUP: User wants to schedule a reminder/follow-up
- CALENDAR_QUERY: User wants to see their calendar/schedule
- BATCH_ARCHIVE: User wants to archive multiple emails
- BATCH_READ: User wants to mark emails as read
- SCHEDULE_MEETING: User wants to schedule a meeting
- FIND_FREE_TIME: User wants to find available time slots
- UNKNOWN: Command doesn't fit any category

Command to classify: "${command.rawCommand}"

Respond with ONLY valid JSON (no markdown): { "intent": "INTENT_NAME", "confidence": 0.0-1.0, "reasoning": "brief explanation" }`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    if (content) {
      // Extract JSON from response (handle potential markdown wrapping)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          intent: parsed.intent as CommandIntent,
          entities: command.entities, // Keep extracted entities
          confidence: parsed.confidence,
          rawCommand: command.rawCommand,
          usedAI: true,
          reasoning: parsed.reasoning,
        };
      }
    }
  } catch (error) {
    console.error('AI classification failed:', error);
  }

  // Fallback to original classification
  return {
    intent: command.intent,
    entities: command.entities,
    confidence: command.confidence,
    rawCommand: command.rawCommand,
    usedAI: false,
  };
}

/**
 * Generate an action plan from the classified intent
 */
export async function executeIntent(classification: IntentClassification): Promise<ActionPlan> {
  const { intent, entities } = classification;

  switch (intent) {
    case 'DRAFT_REPLY':
      return {
        action: 'DRAFT_REPLY',
        params: {
          contact: entities.contact,
          email: entities.email,
        },
        description: `Draft a reply to ${entities.contact || entities.email || 'selected email'}`,
        requiresConfirmation: false,
      };

    case 'SUMMARIZE_INBOX':
      return {
        action: 'SUMMARIZE_INBOX',
        params: {
          timeframe: entities.timeframe || 'today',
        },
        description: 'Summarize your inbox',
        requiresConfirmation: false,
      };

    case 'FILTER_EMAILS':
      return {
        action: 'FILTER_EMAILS',
        params: {
          priority: entities.priority,
          filter: entities.filter,
          timeframe: entities.timeframe,
        },
        description: `Filter emails by ${entities.priority || entities.filter || 'criteria'}`,
        requiresConfirmation: false,
      };

    case 'SEARCH_EMAILS':
      return {
        action: 'SEARCH_EMAILS',
        params: {
          contact: entities.contact,
          email: entities.email,
          subject: entities.subject,
          timeframe: entities.timeframe,
        },
        description: `Search emails${entities.contact ? ` from ${entities.contact}` : ''}`,
        requiresConfirmation: false,
      };

    case 'SCHEDULE_FOLLOWUP':
      return {
        action: 'SCHEDULE_FOLLOWUP',
        params: {
          contact: entities.contact,
          timeframe: entities.timeframe,
        },
        description: `Schedule a follow-up${entities.contact ? ` with ${entities.contact}` : ''}`,
        requiresConfirmation: true,
      };

    case 'CALENDAR_QUERY':
      return {
        action: 'CALENDAR_QUERY',
        params: {
          timeframe: entities.timeframe || 'today',
        },
        description: `Show calendar for ${entities.timeframe || 'today'}`,
        requiresConfirmation: false,
      };

    case 'BATCH_ARCHIVE':
      return {
        action: 'BATCH_ARCHIVE',
        params: {
          filter: entities.filter,
          contact: entities.contact,
        },
        description: `Archive ${entities.filter || 'selected'} emails`,
        requiresConfirmation: true,
      };

    case 'BATCH_READ':
      return {
        action: 'BATCH_READ',
        params: {
          filter: entities.filter,
          contact: entities.contact,
        },
        description: `Mark ${entities.filter || 'selected'} emails as read`,
        requiresConfirmation: true,
      };

    case 'SCHEDULE_MEETING':
      return {
        action: 'SCHEDULE_MEETING',
        params: {
          contact: entities.contact,
          timeframe: entities.timeframe,
        },
        description: `Schedule a meeting${entities.contact ? ` with ${entities.contact}` : ''}`,
        requiresConfirmation: true,
      };

    case 'FIND_FREE_TIME':
      return {
        action: 'FIND_FREE_TIME',
        params: {
          timeframe: entities.timeframe || 'this week',
        },
        description: `Find free time ${entities.timeframe || 'this week'}`,
        requiresConfirmation: false,
      };

    case 'UNKNOWN':
    default:
      return {
        action: 'SHOW_HELP',
        params: {
          originalCommand: classification.rawCommand,
          suggestions: [],
        },
        description: 'Show available commands',
        requiresConfirmation: false,
      };
  }
}

/**
 * Full pipeline: parse → classify → execute
 */
export async function processCommand(rawCommand: string): Promise<{
  classification: IntentClassification;
  actionPlan: ActionPlan;
}> {
  const { parseCommand } = await import('./command-parser');

  // Step 1: Parse the command
  const parsed = await parseCommand(rawCommand);

  // Step 2: Classify (potentially using AI)
  const classification = await classifyIntent(parsed);

  // Step 3: Generate action plan
  const actionPlan = await executeIntent(classification);

  return { classification, actionPlan };
}
