import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateSmartDraft,
  DraftGenerationOptions,
  GeneratedDraft,
} from './smart-draft-generator';
import type { ContactProfile } from './contact-enrichment';

// Mock Gemini
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => 'Thank you for your email. I will review and get back to you shortly.',
        },
      }),
    }),
  })),
}));

describe('Smart Draft Generator', () => {
  const mockEmail = {
    from: 'alice@company.com',
    subject: 'Project Update Request',
    body: 'Hi, can you please send me the latest update on Project Alpha? Thanks!',
    date: Date.now(),
  };

  const mockContactProfile: ContactProfile = {
    email: 'alice@company.com',
    name: 'Alice',
    company: 'company.com',
    interactionCount: 15,
    lastInteraction: Date.now() - 1000 * 60 * 60 * 24,
    relationshipStrength: 0.75,
    suggestedTone: {
      formality: 'casual',
      enthusiasm: 'neutral',
      verbosity: 'brief',
      commonTopics: ['project', 'update', 'deadline'],
    },
    commonTopics: ['project', 'update', 'deadline'],
    responsePatterns: {
      avgResponseTime: 4,
      typicalLength: 'short',
      prefersThreads: true,
    },
  };

  describe('generateSmartDraft', () => {
    it('should generate a draft response', async () => {
      const result = await generateSmartDraft({
        originalEmail: mockEmail,
        contactProfile: mockContactProfile,
      });

      expect(result.body).toBeDefined();
      expect(result.body.length).toBeGreaterThan(0);
    });

    it('should include subject line in response', async () => {
      const result = await generateSmartDraft({
        originalEmail: mockEmail,
        contactProfile: mockContactProfile,
      });

      expect(result.subject).toBeDefined();
      expect(result.subject).toContain('Re:');
    });

    it('should respect tone preferences', async () => {
      const formalProfile: ContactProfile = {
        ...mockContactProfile,
        suggestedTone: {
          formality: 'formal',
          enthusiasm: 'reserved',
          verbosity: 'detailed',
          commonTopics: [],
        },
      };

      const result = await generateSmartDraft({
        originalEmail: mockEmail,
        contactProfile: formalProfile,
      });

      expect(result.toneUsed).toBe('formal');
    });

    it('should include confidence score', async () => {
      const result = await generateSmartDraft({
        originalEmail: mockEmail,
        contactProfile: mockContactProfile,
      });

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle new contacts gracefully', async () => {
      const newContactProfile: ContactProfile = {
        email: 'newperson@example.com',
        name: 'New Person',
        company: 'example.com',
        interactionCount: 0,
        lastInteraction: null,
        relationshipStrength: 0,
        suggestedTone: {
          formality: 'neutral',
          enthusiasm: 'neutral',
          verbosity: 'moderate',
          commonTopics: [],
        },
        commonTopics: [],
        responsePatterns: {
          avgResponseTime: 24,
          typicalLength: 'medium',
          prefersThreads: true,
        },
      };

      const result = await generateSmartDraft({
        originalEmail: {
          ...mockEmail,
          from: 'newperson@example.com',
        },
        contactProfile: newContactProfile,
      });

      expect(result.body).toBeDefined();
      expect(result.toneUsed).toBe('neutral');
    });

    it('should include user instructions when provided', async () => {
      const result = await generateSmartDraft({
        originalEmail: mockEmail,
        contactProfile: mockContactProfile,
        userInstructions: 'Mention that I am out of office next week',
      });

      expect(result.body).toBeDefined();
    });

    it('should return metadata about the generation', async () => {
      const result = await generateSmartDraft({
        originalEmail: mockEmail,
        contactProfile: mockContactProfile,
      });

      expect(result.metadata).toBeDefined();
      expect(result.metadata).toHaveProperty('usedContactContext');
      expect(result.metadata).toHaveProperty('relationshipStrength');
      expect(result.metadata).toHaveProperty('generationTime');
      expect(result.metadata).toHaveProperty('model');
    });
  });

  describe('Draft Generation Options', () => {
    it('should allow length preference', async () => {
      const result = await generateSmartDraft({
        originalEmail: mockEmail,
        contactProfile: mockContactProfile,
        options: { preferredLength: 'short' },
      });

      expect(result.body).toBeDefined();
    });

    it('should allow custom tone override', async () => {
      const result = await generateSmartDraft({
        originalEmail: mockEmail,
        contactProfile: mockContactProfile,
        options: { toneOverride: 'formal' },
      });

      expect(result.toneUsed).toBe('formal');
    });
  });
});
