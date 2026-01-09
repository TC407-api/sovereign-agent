import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseCommand, CommandResult, CommandIntent } from './command-parser';

describe('Command Parser', () => {
  describe('Intent Classification', () => {
    it('should classify "draft a reply to" as DRAFT_REPLY intent', async () => {
      const result = await parseCommand('draft a reply to the email from John');
      expect(result.intent).toBe('DRAFT_REPLY');
      expect(result.entities.contact).toContain('John');
    });

    it('should classify "summarize my inbox" as SUMMARIZE_INBOX intent', async () => {
      const result = await parseCommand('summarize my inbox');
      expect(result.intent).toBe('SUMMARIZE_INBOX');
    });

    it('should classify "show urgent emails" as FILTER_EMAILS intent', async () => {
      const result = await parseCommand('show urgent emails');
      expect(result.intent).toBe('FILTER_EMAILS');
      expect(result.entities.priority).toBe('urgent');
    });

    it('should classify "find emails from Sarah" as SEARCH_EMAILS intent', async () => {
      const result = await parseCommand('find emails from Sarah');
      expect(result.intent).toBe('SEARCH_EMAILS');
      expect(result.entities.contact).toContain('Sarah');
    });

    it('should classify "schedule a follow-up" as SCHEDULE_FOLLOWUP intent', async () => {
      const result = await parseCommand('schedule a follow-up for the project email');
      expect(result.intent).toBe('SCHEDULE_FOLLOWUP');
    });

    it('should classify "what is on my calendar today" as CALENDAR_QUERY intent', async () => {
      const result = await parseCommand('what is on my calendar today');
      expect(result.intent).toBe('CALENDAR_QUERY');
      expect(result.entities.timeframe).toBe('today');
    });

    it('should classify "archive all newsletters" as BATCH_ARCHIVE intent', async () => {
      const result = await parseCommand('archive all newsletters');
      expect(result.intent).toBe('BATCH_ARCHIVE');
      expect(result.entities.filter).toContain('newsletter');
    });

    it('should return UNKNOWN for unrecognized commands', async () => {
      const result = await parseCommand('play some music');
      expect(result.intent).toBe('UNKNOWN');
    });
  });

  describe('Entity Extraction', () => {
    it('should extract contact names from commands', async () => {
      const result = await parseCommand('draft a reply to the email from Alice Smith');
      expect(result.entities.contact).toContain('Alice Smith');
    });

    it('should extract email addresses', async () => {
      const result = await parseCommand('find emails from john@company.com');
      expect(result.entities.email).toBe('john@company.com');
    });

    it('should extract time references', async () => {
      const result = await parseCommand('show emails from last week');
      expect(result.entities.timeframe).toBe('last week');
    });

    it('should extract priority levels', async () => {
      const result = await parseCommand('show high priority emails');
      expect(result.entities.priority).toBe('high');
    });

    it('should extract subject keywords', async () => {
      const result = await parseCommand('find emails about project alpha');
      expect(result.entities.subject).toContain('project alpha');
    });
  });

  describe('Confidence Scores', () => {
    it('should return high confidence for clear commands', async () => {
      const result = await parseCommand('summarize my inbox');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should return lower confidence for ambiguous commands', async () => {
      const result = await parseCommand('help me with emails');
      expect(result.confidence).toBeLessThan(0.7);
    });
  });

  describe('Command Suggestions', () => {
    it('should suggest corrections for typos', async () => {
      const result = await parseCommand('summerize inbox');
      expect(result.suggestions).toContain('summarize my inbox');
    });

    it('should suggest alternatives for partial matches', async () => {
      const result = await parseCommand('emails');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });
});

describe('Command Result Structure', () => {
  it('should have all required fields', async () => {
    const result = await parseCommand('test command');
    expect(result).toHaveProperty('intent');
    expect(result).toHaveProperty('entities');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('rawCommand');
    expect(result).toHaveProperty('suggestions');
  });
});
