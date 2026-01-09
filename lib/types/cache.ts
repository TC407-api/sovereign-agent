export interface CacheEntry {
  id: string;
  queryHash: string;
  queryEmbedding: number[];
  queryText: string;
  response: string;
  modelId: string;
  createdAt: number;
  expiresAt: number;
  hitCount: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttlMs: number;
  maxEntries: number;
  similarityThreshold: number;
  embedModel: string;
}

export interface CacheStats {
  totalEntries: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  estimatedSavings: number;
}

export interface SimilarityMatch {
  entry: CacheEntry;
  similarity: number;
}
