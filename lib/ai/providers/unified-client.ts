/**
 * Unified AI Client - Routes requests to the best available provider
 *
 * Priority order (configurable):
 * 1. Ollama (free, local, private) - for sensitive data or to save cost
 * 2. GPT-4o Mini (cheap, fast, good) - for general tasks
 * 3. Gemini Flash (cheap, fast) - fallback
 */

import type { AIProvider, AICompletionOptions, AICompletionResult, AIProviderConfig } from './types';
import { OllamaProvider } from './ollama';
import { OpenAIProvider } from './openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type ProviderPriority = 'cost' | 'speed' | 'quality' | 'local-first';

export interface UnifiedClientConfig {
  providers: AIProviderConfig;
  priority?: ProviderPriority;
  fallbackEnabled?: boolean;
}

interface ProviderEntry {
  name: string;
  provider: AIProvider | null;
  priority: number;
}

export class UnifiedAIClient {
  private providers: ProviderEntry[] = [];
  private geminiClient: GoogleGenerativeAI | null = null;
  private config: UnifiedClientConfig;

  constructor(config: UnifiedClientConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders() {
    const priority = this.config.priority || 'cost';

    // Initialize Ollama if configured
    if (this.config.providers.ollama) {
      this.providers.push({
        name: 'ollama',
        provider: new OllamaProvider(this.config.providers.ollama),
        priority: priority === 'local-first' ? 0 : priority === 'cost' ? 1 : 3,
      });
    }

    // Initialize OpenAI if configured
    if (this.config.providers.openai?.apiKey) {
      this.providers.push({
        name: 'openai',
        provider: new OpenAIProvider(this.config.providers.openai),
        priority: priority === 'cost' ? 2 : priority === 'quality' ? 1 : 2,
      });
    }

    // Initialize Gemini if configured
    if (this.config.providers.gemini?.apiKey) {
      this.geminiClient = new GoogleGenerativeAI(this.config.providers.gemini.apiKey);
      // Gemini uses a different interface, handled specially
      this.providers.push({
        name: 'gemini',
        provider: null, // Handled separately
        priority: priority === 'speed' ? 1 : 3,
      });
    }

    // Sort by priority (lower = higher priority)
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Complete a request using the best available provider
   */
  async complete(options: AICompletionOptions): Promise<AICompletionResult & { provider: string }> {
    const errors: string[] = [];

    for (const entry of this.providers) {
      try {
        // Check availability
        if (entry.provider) {
          const available = await entry.provider.isAvailable();
          if (!available) {
            errors.push(`${entry.name}: not available`);
            continue;
          }

          const result = await entry.provider.complete(options);
          return { ...result, provider: entry.name };
        }

        // Special handling for Gemini
        if (entry.name === 'gemini' && this.geminiClient) {
          const result = await this.completeWithGemini(options);
          return { ...result, provider: 'gemini' };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`${entry.name}: ${message}`);

        if (!this.config.fallbackEnabled) {
          throw error;
        }
        // Continue to next provider
      }
    }

    throw new Error(`All providers failed: ${errors.join('; ')}`);
  }

  private async completeWithGemini(options: AICompletionOptions): Promise<AICompletionResult> {
    if (!this.geminiClient || !this.config.providers.gemini) {
      throw new Error('Gemini not configured');
    }

    const model = this.geminiClient.getGenerativeModel({
      model: this.config.providers.gemini.model,
    });

    // Convert messages to Gemini format
    const systemMessage = options.messages.find(m => m.role === 'system');
    const chatMessages = options.messages.filter(m => m.role !== 'system');

    const parts: string[] = [];
    if (systemMessage) {
      parts.push(systemMessage.content);
    }
    parts.push(...chatMessages.map(m => `${m.role}: ${m.content}`));

    const result = await model.generateContent(parts.join('\n\n'));
    const text = result.response.text();

    // Gemini doesn't return detailed token counts in the same way
    const estimatedTokens = Math.ceil(text.length / 4);

    return {
      content: text,
      model: this.config.providers.gemini.model,
      usage: {
        promptTokens: estimatedTokens,
        completionTokens: estimatedTokens,
        totalTokens: estimatedTokens * 2,
      },
      finishReason: 'stop',
    };
  }

  /**
   * Get list of available providers
   */
  async getAvailableProviders(): Promise<string[]> {
    const available: string[] = [];

    for (const entry of this.providers) {
      if (entry.provider) {
        const isAvailable = await entry.provider.isAvailable();
        if (isAvailable) available.push(entry.name);
      } else if (entry.name === 'gemini' && this.geminiClient) {
        available.push('gemini');
      }
    }

    return available;
  }
}

/**
 * Create a unified client with environment-based configuration
 */
export function createUnifiedClient(priority: ProviderPriority = 'cost'): UnifiedAIClient {
  return new UnifiedAIClient({
    providers: {
      ollama: {
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'llama3.2',
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      },
      gemini: {
        apiKey: process.env.GOOGLE_API_KEY || '',
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      },
    },
    priority,
    fallbackEnabled: true,
  });
}
