import { describe, it, expect } from 'vitest';
import { PIIScrubber } from './pii-scrubber';

describe('PIIScrubber', () => {
  const scrubber = new PIIScrubber();

  describe('scrub', () => {
    it('should replace PII with placeholders', () => {
      const text = 'Contact John at 555-123-4567 or john@example.com';
      const result = scrubber.scrub(text);
      expect(result.scrubbedText).not.toContain('555-123-4567');
      expect(result.scrubbedText).not.toContain('john@example.com');
      expect(result.scrubbedText).toContain('[PHONE_1]');
      expect(result.scrubbedText).toContain('[EMAIL_1]');
    });

    it('should return mapping for rehydration', () => {
      const text = 'SSN: 123-45-6789';
      const result = scrubber.scrub(text);
      expect(result.mappings).toHaveLength(1);
      expect(result.mappings[0].placeholder).toBe('[SSN_1]');
      expect(result.mappings[0].originalValue).toBe('123-45-6789');
    });

    it('should generate unique session ID', () => {
      const result1 = scrubber.scrub('Phone: 555-123-4567');
      const result2 = scrubber.scrub('Phone: 555-987-6543');
      expect(result1.sessionId).not.toBe(result2.sessionId);
    });
  });

  describe('rehydrate', () => {
    it('should restore original values', () => {
      const original = 'Call me at 555-123-4567';
      const scrubResult = scrubber.scrub(original);
      const aiResponse = `I'll call [PHONE_1] tomorrow.`;
      const rehydrated = scrubber.rehydrate(aiResponse, scrubResult.sessionId);
      expect(rehydrated).toBe(`I'll call 555-123-4567 tomorrow.`);
    });

    it('should throw for invalid session ID', () => {
      expect(() => scrubber.rehydrate('text', 'invalid-id')).toThrow();
    });
  });
});
