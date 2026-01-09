import { describe, it, expect } from 'vitest';
import {
  analyzeDraftSafety,
  SafetyAnalysis,
  detectSensitiveContent,
  analyzeTone,
  checkExternalRecipients,
  ContentFlag,
} from './content-guardrails';

describe('Content Guardrails', () => {
  describe('detectSensitiveContent', () => {
    it('should detect credit card numbers', () => {
      const text = 'My card number is 4111-1111-1111-1111';
      const flags = detectSensitiveContent(text);
      expect(flags.some(f => f.type === 'PII' && f.category === 'credit_card')).toBe(true);
    });

    it('should detect social security numbers', () => {
      const text = 'SSN: 123-45-6789';
      const flags = detectSensitiveContent(text);
      expect(flags.some(f => f.type === 'PII' && f.category === 'ssn')).toBe(true);
    });

    it('should detect phone numbers', () => {
      const text = 'Call me at (555) 123-4567';
      const flags = detectSensitiveContent(text);
      expect(flags.some(f => f.type === 'PII' && f.category === 'phone')).toBe(true);
    });

    it('should detect passwords and secrets', () => {
      const text = 'password: secretPassword123!';
      const flags = detectSensitiveContent(text);
      expect(flags.some(f => f.type === 'CREDENTIAL')).toBe(true);
    });

    it('should detect API keys', () => {
      const text = 'API_KEY=sk_live_abc123xyz789';
      const flags = detectSensitiveContent(text);
      expect(flags.some(f => f.type === 'CREDENTIAL')).toBe(true);
    });

    it('should detect confidential markers', () => {
      const text = 'CONFIDENTIAL: This is sensitive business information';
      const flags = detectSensitiveContent(text);
      expect(flags.some(f => f.type === 'CONFIDENTIAL')).toBe(true);
    });

    it('should return empty array for safe content', () => {
      const text = 'Thank you for your email. I will review it shortly.';
      const flags = detectSensitiveContent(text);
      expect(flags.length).toBe(0);
    });
  });

  describe('analyzeTone', () => {
    it('should detect aggressive language', () => {
      const text = 'This is COMPLETELY UNACCEPTABLE! I demand immediate action!';
      const analysis = analyzeTone(text);
      expect(analysis.hasIssue).toBe(true);
      expect(analysis.issue).toContain('aggressive');
    });

    it('should detect overly casual language for formal contexts', () => {
      const text = 'yo whats up bro, can u send that thing asap lol';
      const analysis = analyzeTone(text, 'formal');
      expect(analysis.hasIssue).toBe(true);
      expect(analysis.issue).toContain('casual');
    });

    it('should accept appropriate tone', () => {
      const text = 'Thank you for reaching out. I would be happy to discuss this further.';
      const analysis = analyzeTone(text);
      expect(analysis.hasIssue).toBe(false);
    });

    it('should detect negative sentiment', () => {
      const text = 'I am extremely disappointed, frustrated, and upset with your terrible service.';
      const analysis = analyzeTone(text);
      expect(analysis.sentiment).toBe('negative');
    });
  });

  describe('checkExternalRecipients', () => {
    it('should warn about external recipients', () => {
      const internalDomain = 'company.com';
      const recipients = ['john@company.com', 'external@othercorp.com'];
      const result = checkExternalRecipients(recipients, internalDomain);
      expect(result.hasExternal).toBe(true);
      expect(result.externalRecipients).toContain('external@othercorp.com');
    });

    it('should not warn for internal only', () => {
      const internalDomain = 'company.com';
      const recipients = ['john@company.com', 'jane@company.com'];
      const result = checkExternalRecipients(recipients, internalDomain);
      expect(result.hasExternal).toBe(false);
    });

    it('should handle multiple external recipients', () => {
      const internalDomain = 'company.com';
      const recipients = ['ext1@a.com', 'ext2@b.com', 'internal@company.com'];
      const result = checkExternalRecipients(recipients, internalDomain);
      expect(result.externalRecipients.length).toBe(2);
    });
  });

  describe('analyzeDraftSafety', () => {
    it('should provide complete safety analysis', () => {
      const draft = {
        body: 'Thank you for your inquiry about Project Alpha.',
        recipients: ['client@external.com'],
      };

      const analysis = analyzeDraftSafety(draft, 'mycompany.com');

      expect(analysis).toHaveProperty('overallRisk');
      expect(analysis).toHaveProperty('contentFlags');
      expect(analysis).toHaveProperty('toneAnalysis');
      expect(analysis).toHaveProperty('externalCheck');
      expect(analysis).toHaveProperty('recommendations');
    });

    it('should flag critical-risk content with SSN', () => {
      const draft = {
        body: 'Here is the password: admin123 and SSN 123-45-6789',
        recipients: ['external@othercorp.com'],
      };

      const analysis = analyzeDraftSafety(draft, 'company.com');

      // SSN is critical severity, so overall risk is critical
      expect(analysis.overallRisk).toBe('critical');
      expect(analysis.contentFlags.length).toBeGreaterThan(0);
    });

    it('should provide recommendations for issues', () => {
      const draft = {
        body: 'api_key=sk_live_abcdefghij1234567890 - please use this for access',
        recipients: ['vendor@external.com'],
      };

      const analysis = analyzeDraftSafety(draft, 'company.com');

      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('should approve safe content', () => {
      const draft = {
        body: 'Looking forward to our meeting next week.',
        recipients: ['colleague@company.com'],
      };

      const analysis = analyzeDraftSafety(draft, 'company.com');

      expect(analysis.overallRisk).toBe('low');
      expect(analysis.approved).toBe(true);
    });
  });
});

describe('ContentFlag', () => {
  it('should have all required fields', () => {
    const flag: ContentFlag = {
      type: 'PII',
      category: 'email',
      severity: 'medium',
      location: { start: 0, end: 10 },
      suggestion: 'Remove email address',
    };

    expect(flag).toHaveProperty('type');
    expect(flag).toHaveProperty('category');
    expect(flag).toHaveProperty('severity');
    expect(flag).toHaveProperty('location');
    expect(flag).toHaveProperty('suggestion');
  });
});
