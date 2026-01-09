import type { CacheEntry, CacheConfig, CacheStats, SimilarityMatch } from '@/lib/types/cache';

type EmbedFn = (text: string) => Promise<number[]>;

export class SemanticCache {
  private entries: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private embed: EmbedFn;
  private hitCount = 0;
  private missCount = 0;

  constructor(config: CacheConfig, embed: EmbedFn) {
    this.config = config;
    this.embed = embed;
  }

  async set(query: string, response: string, modelId: string): Promise<void> {
    if (!this.config.enabled) return;
    const embedding = await this.embed(query);
    const hash = this.hash(query);
    const now = Date.now();
    const entry: CacheEntry = { id: crypto.randomUUID(), queryHash: hash, queryEmbedding: embedding, queryText: query, response, modelId, createdAt: now, expiresAt: now + this.config.ttlMs, hitCount: 0 };
    this.entries.set(hash, entry);
    this.evictIfNeeded();
  }

  async get(query: string): Promise<SimilarityMatch | null> {
    if (!this.config.enabled) return null;
    const hash = this.hash(query);
    const exactMatch = this.entries.get(hash);
    if (exactMatch && !this.isExpired(exactMatch)) {
      exactMatch.hitCount++;
      this.hitCount++;
      return { entry: exactMatch, similarity: 1.0 };
    }
    const embedding = await this.embed(query);
    const match = this.findSimilar(embedding);
    if (match) {
      match.entry.hitCount++;
      this.hitCount++;
      return match;
    }
    this.missCount++;
    return null;
  }

  getStats(): CacheStats {
    const total = this.hitCount + this.missCount;
    return { totalEntries: this.entries.size, hitCount: this.hitCount, missCount: this.missCount, hitRate: total > 0 ? this.hitCount / total : 0, estimatedSavings: this.hitCount * 0.01 };
  }

  private findSimilar(embedding: number[]): SimilarityMatch | null {
    let bestMatch: SimilarityMatch | null = null;
    for (const entry of this.entries.values()) {
      if (this.isExpired(entry)) continue;
      const similarity = this.cosineSimilarity(embedding, entry.queryEmbedding);
      if (similarity >= this.config.similarityThreshold) {
        if (!bestMatch || similarity > bestMatch.similarity) bestMatch = { entry, similarity };
      }
    }
    return bestMatch;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; normA += a[i] * a[i]; normB += b[i] * b[i]; }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private isExpired(entry: CacheEntry): boolean { return Date.now() > entry.expiresAt; }

  private evictIfNeeded(): void {
    if (this.entries.size <= this.config.maxEntries) return;
    const sorted = [...this.entries.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt);
    const toRemove = sorted.slice(0, this.entries.size - this.config.maxEntries);
    toRemove.forEach(([key]) => this.entries.delete(key));
  }

  private hash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) { const chr = text.charCodeAt(i); hash = ((hash << 5) - hash) + chr; hash |= 0; }
    return hash.toString(16);
  }
}
