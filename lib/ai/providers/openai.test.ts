import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIProvider } from './openai';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('OpenAIProvider', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should have correct name', () => {
    const provider = new OpenAIProvider({ apiKey: 'test-key', model: 'gpt-4o-mini' });
    expect(provider.name).toBe('openai');
  });

  it('should check availability by validating API key format', async () => {
    const provider = new OpenAIProvider({ apiKey: 'sk-test123', model: 'gpt-4o-mini' });
    const available = await provider.isAvailable();
    expect(available).toBe(true);
  });

  it('should return false for empty API key', async () => {
    const provider = new OpenAIProvider({ apiKey: '', model: 'gpt-4o-mini' });
    const available = await provider.isAvailable();
    expect(available).toBe(false);
  });

  it('should complete a chat request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Hello! How can I help?' }, finish_reason: 'stop' }],
        model: 'gpt-4o-mini',
        usage: { prompt_tokens: 10, completion_tokens: 8, total_tokens: 18 },
      }),
    });

    const provider = new OpenAIProvider({ apiKey: 'sk-test', model: 'gpt-4o-mini' });
    const result = await provider.complete({
      messages: [{ role: 'user', content: 'Hi' }],
    });

    expect(result.content).toBe('Hello! How can I help?');
    expect(result.model).toBe('gpt-4o-mini');
    expect(result.usage.totalTokens).toBe(18);
    expect(result.finishReason).toBe('stop');
  });

  it('should send correct headers with API key', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
        model: 'gpt-4o-mini',
        usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 },
      }),
    });

    const provider = new OpenAIProvider({ apiKey: 'sk-secret-key', model: 'gpt-4o-mini' });
    await provider.complete({
      messages: [{ role: 'user', content: 'Hi' }],
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer sk-secret-key',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Invalid API key' } }),
    });

    const provider = new OpenAIProvider({ apiKey: 'invalid', model: 'gpt-4o-mini' });

    await expect(provider.complete({
      messages: [{ role: 'user', content: 'Hi' }],
    })).rejects.toThrow('OpenAI API error: Invalid API key');
  });

  it('should pass temperature and max tokens', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
        model: 'gpt-4o-mini',
        usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 },
      }),
    });

    const provider = new OpenAIProvider({ apiKey: 'sk-test', model: 'gpt-4o-mini' });
    await provider.complete({
      messages: [{ role: 'user', content: 'Hi' }],
      temperature: 0.5,
      maxTokens: 500,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"temperature":0.5'),
      })
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"max_tokens":500'),
      })
    );
  });

  it('should handle length finish reason', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Truncated...' }, finish_reason: 'length' }],
        model: 'gpt-4o-mini',
        usage: { prompt_tokens: 5, completion_tokens: 100, total_tokens: 105 },
      }),
    });

    const provider = new OpenAIProvider({ apiKey: 'sk-test', model: 'gpt-4o-mini' });
    const result = await provider.complete({
      messages: [{ role: 'user', content: 'Write a long story' }],
    });

    expect(result.finishReason).toBe('length');
  });
});
