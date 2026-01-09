/**
 * AI Providers - Multi-model support for cost optimization
 *
 * Available providers:
 * - Ollama (local, free) - llama3.2, mistral, etc.
 * - OpenAI (cloud, cheap) - gpt-4o-mini
 * - Gemini (cloud, cheap) - gemini-2.0-flash
 */

export * from './types';
export * from './ollama';
export * from './openai';
export * from './unified-client';
