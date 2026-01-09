import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  executeCommand,
  ExecutionResult,
  summarizeInbox,
  filterEmails,
  searchEmails,
} from './command-executor';
import type { ActionPlan } from './intent-classifier';

// Mock Convex client
const mockConvexClient = {
  query: vi.fn(),
  mutation: vi.fn(),
};

describe('Command Executor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('executeCommand', () => {
    it('should execute SUMMARIZE_INBOX action', async () => {
      const actionPlan: ActionPlan = {
        action: 'SUMMARIZE_INBOX',
        params: { timeframe: 'today' },
        description: 'Summarize your inbox',
        requiresConfirmation: false,
      };

      mockConvexClient.query.mockResolvedValue([
        { subject: 'Meeting tomorrow', priority: 'high' },
        { subject: 'Newsletter', priority: 'low' },
      ]);

      const result = await executeCommand(actionPlan, mockConvexClient);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should execute FILTER_EMAILS action', async () => {
      const actionPlan: ActionPlan = {
        action: 'FILTER_EMAILS',
        params: { priority: 'urgent' },
        description: 'Filter emails by urgent priority',
        requiresConfirmation: false,
      };

      mockConvexClient.query.mockResolvedValue([
        { subject: 'URGENT: Server down', priority: 'urgent' },
      ]);

      const result = await executeCommand(actionPlan, mockConvexClient);
      expect(result.success).toBe(true);
      expect(result.data.emails).toBeDefined();
    });

    it('should execute SEARCH_EMAILS action', async () => {
      const actionPlan: ActionPlan = {
        action: 'SEARCH_EMAILS',
        params: { contact: 'Alice' },
        description: 'Search emails from Alice',
        requiresConfirmation: false,
      };

      mockConvexClient.query.mockResolvedValue([
        { subject: 'Project update', from: 'alice@company.com' },
      ]);

      const result = await executeCommand(actionPlan, mockConvexClient);
      expect(result.success).toBe(true);
      expect(result.data.emails).toBeDefined();
    });

    it('should execute CALENDAR_QUERY action', async () => {
      const actionPlan: ActionPlan = {
        action: 'CALENDAR_QUERY',
        params: { timeframe: 'today' },
        description: 'Show calendar for today',
        requiresConfirmation: false,
      };

      mockConvexClient.query.mockResolvedValue([
        { title: 'Team standup', start: new Date() },
      ]);

      const result = await executeCommand(actionPlan, mockConvexClient);
      expect(result.success).toBe(true);
      expect(result.data.events).toBeDefined();
    });

    it('should return pending for actions requiring confirmation', async () => {
      const actionPlan: ActionPlan = {
        action: 'BATCH_ARCHIVE',
        params: { filter: 'newsletter' },
        description: 'Archive newsletter emails',
        requiresConfirmation: true,
      };

      const result = await executeCommand(actionPlan, mockConvexClient);
      expect(result.status).toBe('pending_confirmation');
      expect(result.confirmationMessage).toBeDefined();
    });

    it('should handle SHOW_HELP action', async () => {
      const actionPlan: ActionPlan = {
        action: 'SHOW_HELP',
        params: {},
        description: 'Show available commands',
        requiresConfirmation: false,
      };

      const result = await executeCommand(actionPlan, mockConvexClient);
      expect(result.success).toBe(true);
      expect(result.data.commands).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      const actionPlan: ActionPlan = {
        action: 'SEARCH_EMAILS',
        params: { contact: 'Unknown' },
        description: 'Search emails',
        requiresConfirmation: false,
      };

      mockConvexClient.query.mockRejectedValue(new Error('Query failed'));

      const result = await executeCommand(actionPlan, mockConvexClient);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('summarizeInbox', () => {
    it('should generate summary with counts by priority', async () => {
      const now = Date.now();
      mockConvexClient.query.mockResolvedValue([
        { subject: 'Urgent task', priority: 'urgent', isRead: false, date: now, from: 'alice@company.com' },
        { subject: 'High priority', priority: 'high', isRead: false, date: now, from: 'bob@company.com' },
        { subject: 'Newsletter', priority: 'low', isRead: true, date: now, from: 'news@company.com' },
      ]);

      const result = await summarizeInbox(mockConvexClient, 'today');
      expect(result.totalUnread).toBe(2);
      expect(result.byPriority.urgent).toBe(1);
      expect(result.byPriority.high).toBe(1);
    });
  });

  describe('filterEmails', () => {
    it('should filter by priority', async () => {
      const allEmails = [
        { subject: 'Urgent', priority: 'urgent' },
        { subject: 'Normal', priority: 'normal' },
      ];
      mockConvexClient.query.mockResolvedValue(allEmails);

      const result = await filterEmails(mockConvexClient, { priority: 'urgent' });
      expect(result.length).toBe(1);
      expect(result[0].priority).toBe('urgent');
    });
  });

  describe('searchEmails', () => {
    it('should search by contact', async () => {
      const allEmails = [
        { subject: 'From Alice', from: 'alice@company.com' },
        { subject: 'From Bob', from: 'bob@company.com' },
      ];
      mockConvexClient.query.mockResolvedValue(allEmails);

      const result = await searchEmails(mockConvexClient, { contact: 'alice' });
      expect(result.length).toBe(1);
      expect(result[0].from).toContain('alice');
    });
  });
});
