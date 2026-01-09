import { describe, expect, test } from 'vitest';
import type { AuditEntry, AuditEventType, ChainOfThought } from './audit';

describe('Audit Types', () => {
  test('AuditEntry captures agent action', () => {
    const entry: AuditEntry = {
      id: 'aud-123',
      timestamp: Date.now(),
      userId: 'user-1',
      eventType: 'action_executed',
      action: 'send_email',
      input: { to: 'test@example.com' },
      output: { success: true },
      durationMs: 150,
    };
    expect(entry.eventType).toBe('action_executed');
  });

  test('ChainOfThought records reasoning', () => {
    const cot: ChainOfThought = {
      id: 'cot-123',
      auditEntryId: 'aud-123',
      steps: [
        { step: 1, reasoning: 'User requested email reply', confidence: 0.95 },
        { step: 2, reasoning: 'Drafted professional response', confidence: 0.88 },
      ],
    };
    expect(cot.steps).toHaveLength(2);
  });

  test('AuditEventType covers all events', () => {
    const types: AuditEventType[] = ['action_requested', 'action_executed', 'approval_requested', 'approval_decided', 'error_occurred'];
    expect(types).toContain('action_executed');
  });

  test('AuditEntry supports error logging', () => {
    const entry: AuditEntry = {
      id: 'aud-124',
      timestamp: Date.now(),
      userId: 'user-1',
      eventType: 'error_occurred',
      action: 'send_email',
      input: {},
      error: { message: 'Failed to send', code: 'SEND_FAILED' },
      durationMs: 50,
    };
    expect(entry.error?.code).toBe('SEND_FAILED');
  });
});
