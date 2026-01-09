/**
 * LLaMA Teacher - Use GPT to generate training examples for LLaMA
 *
 * Strategy:
 * 1. GPT generates high-quality example responses
 * 2. Store examples in a local cache
 * 3. Use examples as few-shot prompts for LLaMA
 * 4. Over time, LLaMA learns your email style
 */

import { OpenAIProvider } from '../providers/openai';
import { OllamaProvider } from '../providers/ollama';
import { SYSTEM_PROMPTS } from '../prompts/email-assistant';

export interface TrainingExample {
  task: string;
  input: string;
  output: string;
  quality: number; // 0-1 rating
  generatedBy: 'gpt' | 'human' | 'llama';
  timestamp: number;
}

export interface TeacherConfig {
  openaiKey: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  examplesPerTask?: number;
}

export class LlamaTeacher {
  private gpt: OpenAIProvider;
  private llama: OllamaProvider;
  private examples: Map<string, TrainingExample[]> = new Map();

  constructor(config: TeacherConfig) {
    this.gpt = new OpenAIProvider({
      apiKey: config.openaiKey,
      model: 'gpt-4o-mini',
    });

    this.llama = new OllamaProvider({
      baseUrl: config.ollamaBaseUrl || 'http://localhost:11434',
      model: config.ollamaModel || 'llama3.2',
    });
  }

  /**
   * Generate training examples using GPT
   */
  async generateExamples(
    task: keyof typeof SYSTEM_PROMPTS,
    scenarios: string[],
  ): Promise<TrainingExample[]> {
    const systemPrompt = SYSTEM_PROMPTS[task];
    const examples: TrainingExample[] = [];

    for (const scenario of scenarios) {
      try {
        const result = await this.gpt.complete({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: scenario },
          ],
          temperature: 0.7,
        });

        examples.push({
          task,
          input: scenario,
          output: result.content,
          quality: 1.0, // GPT examples start at high quality
          generatedBy: 'gpt',
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error(`Failed to generate example for: ${scenario}`, error);
      }
    }

    // Store examples
    const existing = this.examples.get(task) || [];
    this.examples.set(task, [...existing, ...examples]);

    return examples;
  }

  /**
   * Teach LLaMA by running it with few-shot examples
   */
  async teachLlama(
    task: keyof typeof SYSTEM_PROMPTS,
    input: string,
  ): Promise<{ llamaOutput: string; gptOutput: string; similarity: number }> {
    const systemPrompt = SYSTEM_PROMPTS[task];
    const examples = this.examples.get(task) || [];

    // Build few-shot prompt
    let fewShotPrompt = '';
    if (examples.length > 0) {
      const topExamples = examples
        .sort((a, b) => b.quality - a.quality)
        .slice(0, 3);

      fewShotPrompt = topExamples
        .map((ex, i) => `Example ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}`)
        .join('\n\n');
      fewShotPrompt += '\n\nNow handle this:\n';
    }

    // Get LLaMA response with examples
    const llamaResult = await this.llama.complete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: fewShotPrompt + input },
      ],
    });

    // Get GPT response for comparison
    const gptResult = await this.gpt.complete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ],
    });

    // Calculate similarity (simple word overlap for now)
    const similarity = this.calculateSimilarity(llamaResult.content, gptResult.content);

    return {
      llamaOutput: llamaResult.content,
      gptOutput: gptResult.content,
      similarity,
    };
  }

  /**
   * Run LLaMA standalone with learned examples
   */
  async runLlama(
    task: keyof typeof SYSTEM_PROMPTS,
    input: string,
  ): Promise<string> {
    const systemPrompt = SYSTEM_PROMPTS[task];
    const examples = this.examples.get(task) || [];

    // Build few-shot prompt from best examples
    let userPrompt = input;
    if (examples.length > 0) {
      const topExamples = examples
        .sort((a, b) => b.quality - a.quality)
        .slice(0, 3);

      const fewShotPrompt = topExamples
        .map((ex, i) => `Example ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}`)
        .join('\n\n');

      userPrompt = `${fewShotPrompt}\n\nNow handle this:\n${input}`;
    }

    const result = await this.llama.complete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    return result.content;
  }

  /**
   * Add a human-verified example (highest quality)
   */
  addHumanExample(task: string, input: string, output: string): void {
    const examples = this.examples.get(task) || [];
    examples.push({
      task,
      input,
      output,
      quality: 1.0,
      generatedBy: 'human',
      timestamp: Date.now(),
    });
    this.examples.set(task, examples);
  }

  /**
   * Rate an example (feedback loop)
   */
  rateExample(task: string, input: string, rating: number): void {
    const examples = this.examples.get(task) || [];
    const example = examples.find(e => e.input === input);
    if (example) {
      example.quality = rating;
    }
  }

  /**
   * Export examples for persistence
   */
  exportExamples(): Record<string, TrainingExample[]> {
    const result: Record<string, TrainingExample[]> = {};
    for (const [task, examples] of this.examples) {
      result[task] = examples;
    }
    return result;
  }

  /**
   * Import examples from storage
   */
  importExamples(data: Record<string, TrainingExample[]>): void {
    for (const [task, examples] of Object.entries(data)) {
      this.examples.set(task, examples);
    }
  }

  /**
   * Simple similarity calculation (word overlap)
   */
  private calculateSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));

    const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
    const union = new Set([...wordsA, ...wordsB]);

    return intersection.size / union.size;
  }

  /**
   * Get example count for a task
   */
  getExampleCount(task: string): number {
    return this.examples.get(task)?.length || 0;
  }
}

/**
 * Pre-defined training scenarios for email tasks
 */
export const TRAINING_SCENARIOS = {
  draftReply: [
    'Original: "Can we meet tomorrow at 3pm?" Instruction: Accept the meeting',
    'Original: "Please review the attached document" Instruction: Say I\'ll review it by Friday',
    'Original: "Are you available for a call this week?" Instruction: Decline politely, busy this week',
    'Original: "Following up on my previous email" Instruction: Apologize for delay, will respond today',
    'Original: "Can you help me with the project?" Instruction: Say yes, ask what they need',
    'Original: "Invoice attached for payment" Instruction: Confirm receipt, will process',
    'Original: "Happy to connect!" Instruction: Professional networking response',
    'Original: "Sorry for the late response" Instruction: No problem, here\'s what you asked for',
  ],
  intentClassifier: [
    'Reply to Sarah about the budget',
    'Show me emails from John',
    'Schedule a call with the team for next Monday',
    'Archive all newsletters',
    'Star the email from my boss',
    'What emails do I have from this week?',
    'Draft a follow-up to the client',
    'Find emails about the project deadline',
  ],
};
