import { describe, it, expect } from 'vitest';
import type { CacheEntry, CacheConfig, CacheStats, SimilarityMatch } from './cache';

describe('Cache Types', () => {
  it('should define cache entry', () => {
    const entry: CacheEntry = { id: 'cache-1', queryHash: 'abc123', queryEmbedding: [0.1, 0.2, 0.3], queryText: 'Draft a reply to the meeting request', response: 'I would be happy to attend...', modelId: 'gpt-4o-mini', createdAt: Date.now(), expiresAt: Date.now() + 3600000, hitCount: 5 };
    expect(entry.hitCount).toBe(5);
  });

  it('should define cache config', () => {
    const config: CacheConfig = { enabled: true, ttlMs: 3600000, maxEntries: 1000, similarityThreshold: 0.92, embedModel: 'text-embedding-3-small' };
    expect(config.similarityThreshold).toBe(0.92);
  });

  it('should define cache stats', () => {
    const stats: CacheStats = { totalEntries: 500, hitCount: 1200, missCount: 300, hitRate: 0.80, estimatedSavings: 15.50 };
    expect(stats.hitRate).toBe(0.80);
  });

  it('should define similarity match', () => {
    const match: SimilarityMatch = {
      entry: { id: 'cache-1', queryHash: 'abc123', queryEmbedding: [0.1, 0.2, 0.3], queryText: 'Draft a reply', response: 'Response here', modelId: 'gpt-4o-mini', createdAt: Date.now(), expiresAt: Date.now() + 3600000, hitCount: 1 },
      similarity: 0.95,
    };
    expect(match.similarity).toBeGreaterThan(0.9);
  });
});
