import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OllamaProvider } from './ollama';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('OllamaProvider', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should have correct name', () => {
    const provider = new OllamaProvider({ baseUrl: 'http://localhost:11434', model: 'llama3.2' });
    expect(provider.name).toBe('ollama');
  });

  it('should check availability by pinging Ollama', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    const provider = new OllamaProvider({ baseUrl: 'http://localhost:11434', model: 'llama3.2' });
    const available = await provider.isAvailable();

    expect(available).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:11434/api/tags');
  });

  it('should return false when Ollama is not running', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

    const provider = new OllamaProvider({ baseUrl: 'http://localhost:11434', model: 'llama3.2' });
    const available = await provider.isAvailable();

    expect(available).toBe(false);
  });

  it('should complete a chat request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: { content: 'Hello! How can I help you?' },
        eval_count: 10,
        prompt_eval_count: 5,
      }),
    });

    const provider = new OllamaProvider({ baseUrl: 'http://localhost:11434', model: 'llama3.2' });
    const result = await provider.complete({
      messages: [
        { role: 'user', content: 'Hi' },
      ],
    });

    expect(result.content).toBe('Hello! How can I help you?');
    expect(result.model).toBe('llama3.2');
    expect(result.usage.totalTokens).toBe(15);
    expect(result.finishReason).toBe('stop');
  });

  it('should include system message in request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: { content: 'Response' },
        eval_count: 5,
        prompt_eval_count: 10,
      }),
    });

    const provider = new OllamaProvider({ baseUrl: 'http://localhost:11434', model: 'llama3.2' });
    await provider.complete({
      messages: [
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'Hi' },
      ],
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/chat',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"system":"You are helpful"'),
      })
    );
  });

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const provider = new OllamaProvider({ baseUrl: 'http://localhost:11434', model: 'llama3.2' });

    await expect(provider.complete({
      messages: [{ role: 'user', content: 'Hi' }],
    })).rejects.toThrow('Ollama API error: 500');
  });

  it('should use custom model', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: { content: 'Response' },
        eval_count: 5,
        prompt_eval_count: 5,
      }),
    });

    const provider = new OllamaProvider({ baseUrl: 'http://localhost:11434', model: 'mistral' });
    const result = await provider.complete({
      messages: [{ role: 'user', content: 'Hi' }],
    });

    expect(result.model).toBe('mistral');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/chat',
      expect.objectContaining({
        body: expect.stringContaining('"model":"mistral"'),
      })
    );
  });
});
