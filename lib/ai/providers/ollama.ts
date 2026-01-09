/**
 * Ollama Provider - Local LLM inference
 *
 * Connects to a local Ollama instance for free, private AI inference.
 * Perfect for sensitive data that shouldn't leave your machine.
 */

import type { AIProvider, AICompletionOptions, AICompletionResult, AIMessage } from './types';

export interface OllamaConfig {
  baseUrl: string;
  model: string;
}

interface OllamaChatResponse {
  message: { content: string };
  eval_count: number;
  prompt_eval_count: number;
  done: boolean;
}

export class OllamaProvider implements AIProvider {
  readonly name = 'ollama';
  private config: OllamaConfig;

  constructor(config: OllamaConfig) {
    this.config = config;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async complete(options: AICompletionOptions): Promise<AICompletionResult> {
    const { messages, temperature = 0.7 } = options;

    // Extract system message if present
    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: chatMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      stream: false,
      options: {
        temperature,
      },
    };

    if (systemMessage) {
      body.system = systemMessage.content;
    }

    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data: OllamaChatResponse = await response.json();

    return {
      content: data.message.content,
      model: this.config.model,
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
      finishReason: 'stop',
    };
  }
}

/**
 * Create an Ollama provider with default local settings
 */
export function createOllamaProvider(model: string = 'llama3.2'): OllamaProvider {
  return new OllamaProvider({
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model,
  });
}
