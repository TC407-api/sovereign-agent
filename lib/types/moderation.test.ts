import { describe, expect, test } from 'vitest';
import type { ModerationResult, ModerationRule, BlockedContent, ModerationOverride } from './moderation';

describe('Moderation Types', () => {
  test('ModerationResult captures scan outcome', () => {
    const result: ModerationResult = {
      id: 'mod-123',
      contentId: 'draft-1',
      passed: false,
      violations: [{ rule: 'pii_detection', severity: 'high', details: 'SSN detected' }],
      scannedAt: Date.now(),
    };
    expect(result.passed).toBe(false);
    expect(result.violations).toHaveLength(1);
  });

  test('ModerationRule defines detection pattern', () => {
    const rule: ModerationRule = {
      id: 'pii_ssn',
      name: 'SSN Detection',
      pattern: /\d{3}-\d{2}-\d{4}/,
      severity: 'critical',
      action: 'block',
    };
    expect(rule.action).toBe('block');
  });

  test('BlockedContent tracks what was blocked', () => {
    const blocked: BlockedContent = {
      id: 'blk-123',
      contentId: 'draft-1',
      reason: 'Contains PII',
      blockedAt: Date.now(),
      overrideAllowed: true,
    };
    expect(blocked.overrideAllowed).toBe(true);
  });

  test('ModerationOverride allows user bypass', () => {
    const override: ModerationOverride = {
      id: 'ovr-123',
      blockedContentId: 'blk-123',
      userId: 'user-1',
      reason: 'False positive - test data',
      overriddenAt: Date.now(),
    };
    expect(override.reason).toContain('False positive');
  });
});
