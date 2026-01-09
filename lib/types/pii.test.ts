import { describe, it, expect } from 'vitest';
import type { PIIType, PIIPattern, PIIMatch, PIIDetectionResult, PIIScrubConfig, ScrubMapping } from './pii';

describe('PII Types', () => {
  it('should define PII type categories', () => {
    const piiTypes: PIIType[] = ['ssn', 'credit_card', 'phone', 'email', 'name', 'address', 'date_of_birth', 'ip_address'];
    expect(piiTypes).toHaveLength(8);
  });

  it('should define PII pattern structure', () => {
    const pattern: PIIPattern = { type: 'ssn', regex: /\d{3}-\d{2}-\d{4}/, validator: (match) => match.length === 11, priority: 1 };
    expect(pattern.type).toBe('ssn');
    expect(pattern.regex).toBeInstanceOf(RegExp);
    expect(typeof pattern.validator).toBe('function');
    expect(pattern.priority).toBe(1);
  });

  it('should define PII match result', () => {
    const match: PIIMatch = { type: 'credit_card', value: '4111-1111-1111-1111', start: 10, end: 29, confidence: 0.95, placeholder: '[CREDIT_CARD_1]' };
    expect(match.type).toBe('credit_card');
    expect(match.value).toBe('4111-1111-1111-1111');
    expect(match.start).toBe(10);
    expect(match.end).toBe(29);
    expect(match.confidence).toBe(0.95);
    expect(match.placeholder).toContain('CREDIT_CARD');
  });

  it('should define detection result with multiple matches', () => {
    const result: PIIDetectionResult = {
      originalText: 'Call me at 555-123-4567',
      matches: [{ type: 'phone', value: '555-123-4567', start: 11, end: 23, confidence: 0.9, placeholder: '[PHONE_1]' }],
      scrubbedText: 'Call me at [PHONE_1]',
      processingTimeMs: 5
    };
    expect(result.originalText).toBe('Call me at 555-123-4567');
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].type).toBe('phone');
    expect(result.scrubbedText).toBe('Call me at [PHONE_1]');
    expect(result.processingTimeMs).toBe(5);
  });

  it('should define scrub configuration', () => {
    const config: PIIScrubConfig = { enabledTypes: ['ssn', 'credit_card', 'phone'], placeholderFormat: '[{TYPE}_{INDEX}]', preserveFormat: false, minConfidence: 0.8 };
    expect(config.enabledTypes).toEqual(['ssn', 'credit_card', 'phone']);
    expect(config.placeholderFormat).toBe('[{TYPE}_{INDEX}]');
    expect(config.preserveFormat).toBe(false);
    expect(config.minConfidence).toBe(0.8);
  });
});
