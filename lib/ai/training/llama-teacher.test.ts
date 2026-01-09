import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LlamaTeacher, TRAINING_SCENARIOS } from './llama-teacher';

// Mock fetch for both providers
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('LlamaTeacher', () => {
  let teacher: LlamaTeacher;

  beforeEach(() => {
    mockFetch.mockReset();
    teacher = new LlamaTeacher({
      openaiKey: 'sk-test',
      ollamaBaseUrl: 'http://localhost:11434',
      ollamaModel: 'llama3.2',
    });
  });

  describe('generateExamples', () => {
    it('should generate examples using GPT', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Thursday works for me!' }, finish_reason: 'stop' }],
          model: 'gpt-4o-mini',
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
      });

      const examples = await teacher.generateExamples('draftReply', [
        'Original: "Can we meet Thursday?" Instruction: Accept',
      ]);

      expect(examples).toHaveLength(1);
      expect(examples[0].task).toBe('draftReply');
      expect(examples[0].output).toBe('Thursday works for me!');
      expect(examples[0].generatedBy).toBe('gpt');
      expect(examples[0].quality).toBe(1.0);
    });

    it('should store examples internally', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
          model: 'gpt-4o-mini',
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
      });

      await teacher.generateExamples('draftReply', ['Test scenario']);

      expect(teacher.getExampleCount('draftReply')).toBe(1);
    });
  });

  describe('addHumanExample', () => {
    it('should add human-verified examples with high quality', () => {
      teacher.addHumanExample(
        'draftReply',
        'Original: "Meeting tomorrow?" Instruction: Accept',
        'Yes, tomorrow works!'
      );

      expect(teacher.getExampleCount('draftReply')).toBe(1);
      const exported = teacher.exportExamples();
      expect(exported['draftReply'][0].quality).toBe(1.0);
      expect(exported['draftReply'][0].generatedBy).toBe('human');
    });
  });

  describe('rateExample', () => {
    it('should update example quality rating', () => {
      teacher.addHumanExample('draftReply', 'Test input', 'Test output');
      teacher.rateExample('draftReply', 'Test input', 0.5);

      const exported = teacher.exportExamples();
      expect(exported['draftReply'][0].quality).toBe(0.5);
    });
  });

  describe('exportExamples / importExamples', () => {
    it('should export and import examples', () => {
      teacher.addHumanExample('draftReply', 'Input 1', 'Output 1');
      teacher.addHumanExample('intentClassifier', 'Input 2', 'Output 2');

      const exported = teacher.exportExamples();

      const newTeacher = new LlamaTeacher({ openaiKey: 'sk-test' });
      newTeacher.importExamples(exported);

      expect(newTeacher.getExampleCount('draftReply')).toBe(1);
      expect(newTeacher.getExampleCount('intentClassifier')).toBe(1);
    });
  });

  describe('runLlama', () => {
    it('should include few-shot examples in prompt', async () => {
      // Add some examples first
      teacher.addHumanExample(
        'draftReply',
        'Original: "Call tomorrow?" Instruction: Accept',
        'Yes, call me anytime tomorrow.'
      );

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          message: { content: 'LLaMA response here' },
          eval_count: 10,
          prompt_eval_count: 50,
        }),
      });

      const result = await teacher.runLlama(
        'draftReply',
        'Original: "Meeting Friday?" Instruction: Accept'
      );

      expect(result).toBe('LLaMA response here');

      // Verify fetch was called (Ollama format)
      expect(mockFetch).toHaveBeenCalled();
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      // Ollama uses messages array with user content containing examples
      expect(requestBody.messages).toBeDefined();
      expect(requestBody.messages[0].content).toContain('Example 1');
      expect(requestBody.messages[0].content).toContain('Now handle this');
    });
  });
});

describe('TRAINING_SCENARIOS', () => {
  it('should have scenarios for draftReply', () => {
    expect(TRAINING_SCENARIOS.draftReply).toBeDefined();
    expect(TRAINING_SCENARIOS.draftReply.length).toBeGreaterThan(5);
  });

  it('should have scenarios for intentClassifier', () => {
    expect(TRAINING_SCENARIOS.intentClassifier).toBeDefined();
    expect(TRAINING_SCENARIOS.intentClassifier.length).toBeGreaterThan(5);
  });

  it('draftReply scenarios should include instruction format', () => {
    for (const scenario of TRAINING_SCENARIOS.draftReply) {
      expect(scenario).toContain('Original:');
      expect(scenario).toContain('Instruction:');
    }
  });
});
