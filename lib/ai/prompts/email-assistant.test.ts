import { describe, it, expect } from 'vitest';
import { SYSTEM_PROMPTS, FEW_SHOT_EXAMPLES, buildPrompt } from './email-assistant';

describe('Email Assistant Prompts', () => {
  describe('SYSTEM_PROMPTS', () => {
    it('should have all required prompt types', () => {
      expect(SYSTEM_PROMPTS.draftReply).toBeDefined();
      expect(SYSTEM_PROMPTS.intentClassifier).toBeDefined();
      expect(SYSTEM_PROMPTS.emailTriage).toBeDefined();
      expect(SYSTEM_PROMPTS.toneAnalyzer).toBeDefined();
      expect(SYSTEM_PROMPTS.meetingPrep).toBeDefined();
    });

    it('draftReply should instruct to output only body', () => {
      expect(SYSTEM_PROMPTS.draftReply).toContain('ONLY the email body');
      expect(SYSTEM_PROMPTS.draftReply).toContain('no subject lines');
    });

    it('intentClassifier should specify JSON output', () => {
      expect(SYSTEM_PROMPTS.intentClassifier).toContain('JSON only');
      expect(SYSTEM_PROMPTS.intentClassifier).toContain('intent');
      expect(SYSTEM_PROMPTS.intentClassifier).toContain('entities');
      expect(SYSTEM_PROMPTS.intentClassifier).toContain('confidence');
    });

    it('emailTriage should define priority levels', () => {
      expect(SYSTEM_PROMPTS.emailTriage).toContain('urgent');
      expect(SYSTEM_PROMPTS.emailTriage).toContain('high');
      expect(SYSTEM_PROMPTS.emailTriage).toContain('normal');
      expect(SYSTEM_PROMPTS.emailTriage).toContain('low');
    });

    it('toneAnalyzer should flag aggressive patterns', () => {
      expect(SYSTEM_PROMPTS.toneAnalyzer).toContain('ALL CAPS');
      expect(SYSTEM_PROMPTS.toneAnalyzer).toContain('exclamation marks');
      expect(SYSTEM_PROMPTS.toneAnalyzer.toLowerCase()).toContain('passive aggressive');
    });
  });

  describe('FEW_SHOT_EXAMPLES', () => {
    it('should have examples for draftReply', () => {
      expect(FEW_SHOT_EXAMPLES.draftReply).toBeDefined();
      expect(FEW_SHOT_EXAMPLES.draftReply.length).toBeGreaterThan(0);
    });

    it('each example should have input and output', () => {
      for (const example of FEW_SHOT_EXAMPLES.draftReply) {
        expect(example.input).toBeDefined();
        expect(example.output).toBeDefined();
        expect(typeof example.output).toBe('string');
      }
    });

    it('examples should be concise', () => {
      for (const example of FEW_SHOT_EXAMPLES.draftReply) {
        // Output should be under 200 chars (concise replies)
        expect(example.output.length).toBeLessThan(200);
      }
    });
  });

  describe('buildPrompt', () => {
    it('should return system and user messages', () => {
      const result = buildPrompt('draftReply', 'Test input', false);

      expect(result.system).toBe(SYSTEM_PROMPTS.draftReply);
      expect(result.user).toBe('Test input');
    });

    it('should include few-shot examples when requested', () => {
      const result = buildPrompt('draftReply', 'Test input', true);

      expect(result.user).toContain('Example 1');
      expect(result.user).toContain('Now handle this');
      expect(result.user).toContain('Test input');
    });

    it('should not include examples when disabled', () => {
      const result = buildPrompt('draftReply', 'Test input', false);

      expect(result.user).not.toContain('Example');
      expect(result.user).toBe('Test input');
    });

    it('should work for tasks without few-shot examples', () => {
      const result = buildPrompt('meetingPrep', 'Prepare for meeting', true);

      expect(result.system).toBe(SYSTEM_PROMPTS.meetingPrep);
      expect(result.user).toBe('Prepare for meeting');
    });
  });
});
