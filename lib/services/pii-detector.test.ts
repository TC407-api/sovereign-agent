import { describe, it, expect } from 'vitest';
import { RegexPIIDetector } from './pii-detector';

describe('RegexPIIDetector', () => {
  const detector = new RegexPIIDetector();

  describe('SSN detection', () => {
    it('should detect SSN format XXX-XX-XXXX', () => {
      const result = detector.detect('My SSN is 123-45-6789');
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].type).toBe('ssn');
      expect(result.matches[0].value).toBe('123-45-6789');
    });

    it('should not match invalid SSN', () => {
      const result = detector.detect('Number 000-00-0000 invalid');
      expect(result.matches).toHaveLength(0);
    });
  });

  describe('Credit card detection', () => {
    it('should detect Visa card', () => {
      const result = detector.detect('Card: 4111-1111-1111-1111');
      expect(result.matches[0].type).toBe('credit_card');
    });
  });

  describe('Phone detection', () => {
    it('should detect US phone formats', () => {
      const result = detector.detect('Call (555) 123-4567');
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].type).toBe('phone');
    });
  });

  describe('Email detection', () => {
    it('should detect email addresses', () => {
      const result = detector.detect('Contact: john.doe@example.com');
      expect(result.matches[0].type).toBe('email');
      expect(result.matches[0].value).toBe('john.doe@example.com');
    });
  });

  describe('Performance', () => {
    it('should process in under 100ms', () => {
      const longText = 'Lorem ipsum '.repeat(100) + '123-45-6789';
      const result = detector.detect(longText);
      expect(result.processingTimeMs).toBeLessThan(100);
    });
  });
});
