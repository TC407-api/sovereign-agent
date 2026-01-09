import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  enrichContactContext,
  extractContactFromEmail,
  calculateRelationshipStrength,
  inferToneFromHistory,
  ContactProfile,
  RelationshipContext,
} from './contact-enrichment';

describe('Contact Enrichment', () => {
  describe('extractContactFromEmail', () => {
    it('should extract name and email from standard format', () => {
      const result = extractContactFromEmail('John Smith <john@company.com>');
      expect(result.name).toBe('John Smith');
      expect(result.email).toBe('john@company.com');
    });

    it('should handle email-only format', () => {
      const result = extractContactFromEmail('john@company.com');
      expect(result.name).toBe('john');
      expect(result.email).toBe('john@company.com');
    });

    it('should extract company domain', () => {
      const result = extractContactFromEmail('John Smith <john@acmecorp.com>');
      expect(result.company).toBe('acmecorp.com');
    });

    it('should handle quoted names', () => {
      const result = extractContactFromEmail('"Dr. Jane Doe" <jane@hospital.org>');
      expect(result.name).toBe('Dr. Jane Doe');
    });
  });

  describe('calculateRelationshipStrength', () => {
    it('should return high strength for frequent interactions', () => {
      const interactions = {
        totalEmails: 50,
        lastInteraction: Date.now() - 1000 * 60 * 60, // 1 hour ago
        responseRate: 0.9,
        avgResponseTime: 2, // hours
      };

      const strength = calculateRelationshipStrength(interactions);
      expect(strength).toBeGreaterThan(0.7);
    });

    it('should return low strength for infrequent interactions', () => {
      const interactions = {
        totalEmails: 2,
        lastInteraction: Date.now() - 1000 * 60 * 60 * 24 * 90, // 90 days ago
        responseRate: 0.5,
        avgResponseTime: 48, // hours
      };

      const strength = calculateRelationshipStrength(interactions);
      expect(strength).toBeLessThan(0.4);
    });

    it('should factor in recency', () => {
      const recentInteractions = {
        totalEmails: 10,
        lastInteraction: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
        responseRate: 0.8,
        avgResponseTime: 4,
      };

      const oldInteractions = {
        totalEmails: 10,
        lastInteraction: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
        responseRate: 0.8,
        avgResponseTime: 4,
      };

      const recentStrength = calculateRelationshipStrength(recentInteractions);
      const oldStrength = calculateRelationshipStrength(oldInteractions);

      expect(recentStrength).toBeGreaterThan(oldStrength);
    });
  });

  describe('inferToneFromHistory', () => {
    it('should infer formal tone from business emails', () => {
      const emails = [
        { subject: 'Q4 Budget Review', body: 'Dear Mr. Smith, Please find attached...' },
        { subject: 'Meeting Request', body: 'I would like to schedule a meeting...' },
      ];

      const tone = inferToneFromHistory(emails);
      expect(tone.formality).toBe('formal');
    });

    it('should infer casual tone from friendly emails', () => {
      const emails = [
        { subject: 'Hey!', body: 'Hey John! How are you doing?' },
        { subject: 'Re: Weekend plans', body: 'Sounds great! See you there!' },
      ];

      const tone = inferToneFromHistory(emails);
      expect(tone.formality).toBe('casual');
    });

    it('should detect common topics', () => {
      const emails = [
        { subject: 'Project Alpha Update', body: 'Here is the latest on Project Alpha...' },
        { subject: 'Re: Project Alpha', body: 'Thanks for the update on the project...' },
        { subject: 'Project Alpha Timeline', body: 'Let\'s discuss the timeline...' },
      ];

      const tone = inferToneFromHistory(emails);
      expect(tone.commonTopics).toContain('project');
    });
  });

  describe('enrichContactContext', () => {
    it('should build complete contact profile', async () => {
      const mockEmails = [
        {
          from: 'alice@company.com',
          subject: 'Project Update',
          body: 'Hi, here is the update...',
          date: Date.now() - 1000 * 60 * 60 * 24,
        },
        {
          from: 'alice@company.com',
          subject: 'Re: Project Update',
          body: 'Thanks for checking in...',
          date: Date.now() - 1000 * 60 * 60 * 48,
        },
      ];

      const profile = await enrichContactContext('alice@company.com', mockEmails);

      expect(profile.email).toBe('alice@company.com');
      expect(profile.interactionCount).toBe(2);
      expect(profile.relationshipStrength).toBeGreaterThan(0);
      expect(profile.suggestedTone).toBeDefined();
    });

    it('should handle new contacts gracefully', async () => {
      const profile = await enrichContactContext('newperson@example.com', []);

      expect(profile.email).toBe('newperson@example.com');
      expect(profile.interactionCount).toBe(0);
      expect(profile.relationshipStrength).toBe(0);
      expect(profile.suggestedTone.formality).toBe('neutral');
    });
  });
});

describe('RelationshipContext', () => {
  it('should have all required fields', async () => {
    const mockEmails = [
      {
        from: 'test@example.com',
        subject: 'Test',
        body: 'Test body',
        date: Date.now(),
      },
    ];

    const profile = await enrichContactContext('test@example.com', mockEmails);

    expect(profile).toHaveProperty('email');
    expect(profile).toHaveProperty('name');
    expect(profile).toHaveProperty('company');
    expect(profile).toHaveProperty('interactionCount');
    expect(profile).toHaveProperty('lastInteraction');
    expect(profile).toHaveProperty('relationshipStrength');
    expect(profile).toHaveProperty('suggestedTone');
    expect(profile).toHaveProperty('commonTopics');
  });
});
