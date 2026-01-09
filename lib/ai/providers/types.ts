/**
 * AI Provider Types - Unified interface for multiple AI backends
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AICompletionResult {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'error';
}

export interface AIProvider {
  readonly name: string;
  readonly isAvailable: () => Promise<boolean>;
  complete(options: AICompletionOptions): Promise<AICompletionResult>;
}

export interface AIProviderConfig {
  ollama?: {
    baseUrl: string;
    model: string;
  };
  openai?: {
    apiKey: string;
    model: string;
  };
  gemini?: {
    apiKey: string;
    model: string;
  };
}
