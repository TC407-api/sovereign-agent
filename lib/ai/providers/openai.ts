/**
 * OpenAI Provider - GPT-4o Mini for cost-effective AI
 *
 * GPT-4o Mini is incredibly cheap ($0.15/1M input, $0.60/1M output)
 * while still being very capable for most tasks.
 */

import type { AIProvider, AICompletionOptions, AICompletionResult } from './types';

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

interface OpenAIChatResponse {
  choices: Array<{
    message: { content: string };
    finish_reason: 'stop' | 'length' | 'content_filter';
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIErrorResponse {
  error: { message: string };
}

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
  }

  async isAvailable(): Promise<boolean> {
    // Basic validation - check if API key looks valid
    return Boolean(this.config.apiKey && this.config.apiKey.length > 0);
  }

  async complete(options: AICompletionOptions): Promise<AICompletionResult> {
    const { messages, temperature = 0.7, maxTokens } = options;

    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
    };

    if (maxTokens) {
      body.max_tokens = maxTokens;
    }

    const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData: OpenAIErrorResponse = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.status}`);
    }

    const data: OpenAIChatResponse = await response.json();
    const choice = data.choices[0];

    return {
      content: choice.message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      finishReason: choice.finish_reason === 'length' ? 'length' : 'stop',
    };
  }
}

/**
 * Create an OpenAI provider with GPT-4o Mini (cheapest good model)
 */
export function createOpenAIProvider(model: string = 'gpt-4o-mini'): OpenAIProvider {
  return new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY || '',
    model,
  });
}
