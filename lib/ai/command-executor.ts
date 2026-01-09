/**
 * Command Executor - Executes AI command action plans
 *
 * Takes an ActionPlan from the intent classifier and executes it
 * against the Convex backend.
 */

import type { ActionPlan } from './intent-classifier';
import { getCommandExamples } from './command-parser';

export interface ExecutionResult {
  success: boolean;
  status: 'completed' | 'pending_confirmation' | 'error';
  data: Record<string, unknown>;
  error?: string;
  confirmationMessage?: string;
}

interface ConvexClient {
  query: (queryFn: unknown, args?: Record<string, unknown>) => Promise<unknown>;
  mutation: (mutationFn: unknown, args?: Record<string, unknown>) => Promise<unknown>;
}

interface Email {
  _id: string;
  subject: string;
  from: string;
  body?: string;
  snippet?: string;
  priority: string;
  isRead: boolean;
  date: number;
}

interface CalendarEvent {
  _id: string;
  title: string;
  start: Date | string | number;
  end?: Date | string | number;
  description?: string;
}

/**
 * Execute a command action plan
 */
export async function executeCommand(
  actionPlan: ActionPlan,
  convexClient: ConvexClient
): Promise<ExecutionResult> {
  // Check if action requires confirmation
  if (actionPlan.requiresConfirmation) {
    return {
      success: true,
      status: 'pending_confirmation',
      data: { action: actionPlan.action, params: actionPlan.params },
      confirmationMessage: `Are you sure you want to ${actionPlan.description.toLowerCase()}?`,
    };
  }

  try {
    switch (actionPlan.action) {
      case 'SUMMARIZE_INBOX':
        const summary = await summarizeInbox(
          convexClient,
          actionPlan.params.timeframe as string
        );
        return {
          success: true,
          status: 'completed',
          data: summary,
        };

      case 'FILTER_EMAILS':
        const filteredEmails = await filterEmails(convexClient, actionPlan.params);
        return {
          success: true,
          status: 'completed',
          data: { emails: filteredEmails, count: filteredEmails.length },
        };

      case 'SEARCH_EMAILS':
        const searchResults = await searchEmails(convexClient, actionPlan.params);
        return {
          success: true,
          status: 'completed',
          data: { emails: searchResults, count: searchResults.length },
        };

      case 'CALENDAR_QUERY':
        const events = await queryCalendar(
          convexClient,
          actionPlan.params.timeframe as string
        );
        return {
          success: true,
          status: 'completed',
          data: { events, count: events.length },
        };

      case 'DRAFT_REPLY':
        // Return action plan for UI to handle
        return {
          success: true,
          status: 'completed',
          data: {
            action: 'navigate',
            route: '/drafts/new',
            params: actionPlan.params,
          },
        };

      case 'SHOW_HELP':
        return {
          success: true,
          status: 'completed',
          data: {
            commands: getCommandExamples(),
            message: 'Here are some things you can ask me to do:',
          },
        };

      default:
        return {
          success: true,
          status: 'completed',
          data: {
            action: actionPlan.action,
            params: actionPlan.params,
            message: `Action ${actionPlan.action} acknowledged`,
          },
        };
    }
  } catch (error) {
    return {
      success: false,
      status: 'error',
      data: {},
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Summarize inbox emails
 */
export async function summarizeInbox(
  convexClient: ConvexClient,
  timeframe: string
): Promise<{
  totalUnread: number;
  byPriority: Record<string, number>;
  topSenders: Array<{ name: string; count: number }>;
  highlights: string[];
}> {
  // Query emails from Convex
  const emails = (await convexClient.query({} /* api.emails.listEmails */)) as Email[];

  // Filter by timeframe if specified
  const now = Date.now();
  const filteredEmails = filterByTimeframe(emails, timeframe, now);

  // Count unread
  const unreadEmails = filteredEmails.filter(e => !e.isRead);

  // Count by priority
  const byPriority: Record<string, number> = {};
  for (const email of unreadEmails) {
    const priority = email.priority || 'normal';
    byPriority[priority] = (byPriority[priority] || 0) + 1;
  }

  // Count top senders
  const senderCounts: Record<string, number> = {};
  for (const email of filteredEmails) {
    const sender = extractSenderName(email.from);
    senderCounts[sender] = (senderCounts[sender] || 0) + 1;
  }
  const topSenders = Object.entries(senderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Generate highlights
  const highlights: string[] = [];
  if (byPriority.urgent) {
    highlights.push(`${byPriority.urgent} urgent email${byPriority.urgent > 1 ? 's' : ''} need attention`);
  }
  if (byPriority.high) {
    highlights.push(`${byPriority.high} high priority email${byPriority.high > 1 ? 's' : ''}`);
  }
  if (unreadEmails.length === 0) {
    highlights.push('All caught up!');
  }

  return {
    totalUnread: unreadEmails.length,
    byPriority,
    topSenders,
    highlights,
  };
}

/**
 * Filter emails by criteria
 */
export async function filterEmails(
  convexClient: ConvexClient,
  params: Record<string, unknown>
): Promise<Email[]> {
  const emails = (await convexClient.query({} /* api.emails.listEmails */)) as Email[];

  return emails.filter(email => {
    // Filter by priority
    if (params.priority && email.priority !== params.priority) {
      return false;
    }

    // Filter by read status
    if (params.filter === 'unread' && email.isRead) {
      return false;
    }

    return true;
  });
}

/**
 * Search emails by various criteria
 */
export async function searchEmails(
  convexClient: ConvexClient,
  params: Record<string, unknown>
): Promise<Email[]> {
  const emails = (await convexClient.query({} /* api.emails.listEmails */)) as Email[];

  return emails.filter(email => {
    // Search by contact/sender
    if (params.contact) {
      const contact = String(params.contact).toLowerCase();
      if (!email.from.toLowerCase().includes(contact)) {
        return false;
      }
    }

    // Search by email address
    if (params.email) {
      const emailAddr = String(params.email).toLowerCase();
      if (!email.from.toLowerCase().includes(emailAddr)) {
        return false;
      }
    }

    // Search by subject
    if (params.subject) {
      const subject = String(params.subject).toLowerCase();
      if (!email.subject.toLowerCase().includes(subject)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Query calendar events
 */
export async function queryCalendar(
  convexClient: ConvexClient,
  timeframe: string
): Promise<CalendarEvent[]> {
  const events = (await convexClient.query({} /* api.events.listEvents */)) as CalendarEvent[];

  const now = Date.now();
  return filterEventsByTimeframe(events, timeframe, now);
}

// Helper functions

function filterByTimeframe(emails: Email[], timeframe: string, now: number): Email[] {
  const ranges: Record<string, number> = {
    'today': 24 * 60 * 60 * 1000,
    'yesterday': 48 * 60 * 60 * 1000,
    'this week': 7 * 24 * 60 * 60 * 1000,
    'last week': 14 * 24 * 60 * 60 * 1000,
    'this month': 30 * 24 * 60 * 60 * 1000,
  };

  const range = ranges[timeframe] || ranges['this week'];
  const cutoff = now - range;

  return emails.filter(e => e.date >= cutoff);
}

function filterEventsByTimeframe(
  events: CalendarEvent[],
  timeframe: string,
  now: number
): CalendarEvent[] {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  let startTime: number;
  let endTime: number;

  switch (timeframe) {
    case 'today':
      startTime = startOfDay.getTime();
      endTime = startTime + 24 * 60 * 60 * 1000;
      break;
    case 'tomorrow':
      startTime = startOfDay.getTime() + 24 * 60 * 60 * 1000;
      endTime = startTime + 24 * 60 * 60 * 1000;
      break;
    case 'this week':
      startTime = startOfDay.getTime();
      endTime = startTime + 7 * 24 * 60 * 60 * 1000;
      break;
    default:
      startTime = now;
      endTime = now + 7 * 24 * 60 * 60 * 1000;
  }

  return events.filter(event => {
    const eventStart = typeof event.start === 'number'
      ? event.start
      : new Date(event.start).getTime();
    return eventStart >= startTime && eventStart <= endTime;
  });
}

function extractSenderName(from: string): string {
  // Extract name from "Name <email@example.com>" format
  const match = from.match(/^([^<]+)/);
  if (match) {
    return match[1].trim();
  }
  // Fallback to email username
  const emailMatch = from.match(/([^@]+)@/);
  return emailMatch ? emailMatch[1] : from;
}
