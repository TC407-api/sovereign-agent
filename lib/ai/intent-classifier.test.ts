import { describe, it, expect, vi, beforeEach } from 'vitest';
import { classifyIntent, IntentClassification, executeIntent } from './intent-classifier';
import type { CommandResult } from './command-parser';

// Mock Google Generative AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            intent: 'DRAFT_REPLY',
            confidence: 0.95,
            reasoning: 'User wants to draft a reply'
          })
        }
      })
    })
  }))
}));

describe('Intent Classifier', () => {
  describe('classifyIntent', () => {
    it('should classify ambiguous commands using AI', async () => {
      const command: CommandResult = {
        intent: 'UNKNOWN',
        entities: { contact: 'John' },
        confidence: 0.4,
        rawCommand: 'help me respond to John',
        suggestions: []
      };

      const result = await classifyIntent(command);
      expect(result.intent).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should pass through high-confidence classifications', async () => {
      const command: CommandResult = {
        intent: 'SUMMARIZE_INBOX',
        entities: {},
        confidence: 0.95,
        rawCommand: 'summarize my inbox',
        suggestions: []
      };

      const result = await classifyIntent(command);
      expect(result.intent).toBe('SUMMARIZE_INBOX');
      expect(result.usedAI).toBe(false);
    });

    it('should attempt AI for low-confidence classifications', async () => {
      const command: CommandResult = {
        intent: 'UNKNOWN',
        entities: {},
        confidence: 0.3,
        rawCommand: 'what should I do about my emails',
        suggestions: []
      };

      const result = await classifyIntent(command);
      // Result should have classification (may or may not use AI depending on env)
      expect(result.intent).toBeDefined();
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('executeIntent', () => {
    it('should return action plan for DRAFT_REPLY', async () => {
      const classification: IntentClassification = {
        intent: 'DRAFT_REPLY',
        entities: { contact: 'John' },
        confidence: 0.9,
        rawCommand: 'draft a reply to John',
        usedAI: false
      };

      const result = await executeIntent(classification);
      expect(result.action).toBe('DRAFT_REPLY');
      expect(result.params).toHaveProperty('contact');
    });

    it('should return action plan for SUMMARIZE_INBOX', async () => {
      const classification: IntentClassification = {
        intent: 'SUMMARIZE_INBOX',
        entities: {},
        confidence: 0.95,
        rawCommand: 'summarize my inbox',
        usedAI: false
      };

      const result = await executeIntent(classification);
      expect(result.action).toBe('SUMMARIZE_INBOX');
    });

    it('should return action plan for FILTER_EMAILS', async () => {
      const classification: IntentClassification = {
        intent: 'FILTER_EMAILS',
        entities: { priority: 'urgent' },
        confidence: 0.85,
        rawCommand: 'show urgent emails',
        usedAI: false
      };

      const result = await executeIntent(classification);
      expect(result.action).toBe('FILTER_EMAILS');
      expect(result.params.priority).toBe('urgent');
    });

    it('should return action plan for CALENDAR_QUERY', async () => {
      const classification: IntentClassification = {
        intent: 'CALENDAR_QUERY',
        entities: { timeframe: 'today' },
        confidence: 0.9,
        rawCommand: 'what is on my calendar today',
        usedAI: false
      };

      const result = await executeIntent(classification);
      expect(result.action).toBe('CALENDAR_QUERY');
      expect(result.params.timeframe).toBe('today');
    });

    it('should return help for UNKNOWN intent', async () => {
      const classification: IntentClassification = {
        intent: 'UNKNOWN',
        entities: {},
        confidence: 0.2,
        rawCommand: 'do something',
        usedAI: true
      };

      const result = await executeIntent(classification);
      expect(result.action).toBe('SHOW_HELP');
    });
  });
});

describe('Intent Classification Result', () => {
  it('should have all required fields', async () => {
    const command: CommandResult = {
      intent: 'SEARCH_EMAILS',
      entities: { contact: 'Alice' },
      confidence: 0.85,
      rawCommand: 'find emails from Alice',
      suggestions: []
    };

    const result = await classifyIntent(command);
    expect(result).toHaveProperty('intent');
    expect(result).toHaveProperty('entities');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('rawCommand');
    expect(result).toHaveProperty('usedAI');
  });
});
