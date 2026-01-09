import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SemanticCache } from './semantic-cache';

// Return different embeddings for different queries
const mockEmbedding = vi.fn().mockImplementation((text: string) => {
  if (text === 'Query 1' || text === 'Draft email reply') {
    return Promise.resolve([0.1, 0.2, 0.3, 0.4, 0.5]);
  }
  // Different embedding for unknown queries - low similarity
  return Promise.resolve([0.9, 0.8, 0.1, 0.05, 0.02]);
});

describe('SemanticCache', () => {
  let cache: SemanticCache;

  beforeEach(() => {
    mockEmbedding.mockClear();
    cache = new SemanticCache({ enabled: true, ttlMs: 3600000, maxEntries: 100, similarityThreshold: 0.90, embedModel: 'text-embedding-3-small' }, mockEmbedding);
  });

  describe('set', () => {
    it('should store a cache entry', async () => {
      await cache.set('Draft email reply', 'Here is a reply...', 'gpt-4o-mini');
      expect(mockEmbedding).toHaveBeenCalledWith('Draft email reply');
    });
  });

  describe('get', () => {
    it('should return cached response for exact match', async () => {
      await cache.set('Draft email reply', 'Here is a reply...', 'gpt-4o-mini');
      const result = await cache.get('Draft email reply');
      expect(result).not.toBeNull();
      expect(result?.entry.response).toBe('Here is a reply...');
    });

    it('should return null for no match', async () => {
      const result = await cache.get('Completely different query');
      expect(result).toBeNull();
    });
  });

  describe('stats', () => {
    it('should track hit and miss counts', async () => {
      await cache.set('Query 1', 'Response 1', 'gpt-4o-mini');
      await cache.get('Query 1'); // hit
      await cache.get('Unknown query'); // miss
      const stats = cache.getStats();
      expect(stats.hitCount).toBe(1);
      expect(stats.missCount).toBe(1);
    });
  });
});
