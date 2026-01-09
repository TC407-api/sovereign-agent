import type { RateLimitConfig, RateLimitStatus, RateLimitBucket } from '@/lib/types/rate-limit';

export class RateLimiter {
  private config: RateLimitConfig;
  private buckets: Map<string, RateLimitBucket> = new Map();

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  tryAcquire(userId: string): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(userId);
    if (!bucket) {
      bucket = { userId, action: this.config.action, requests: [], blockedUntil: null };
      this.buckets.set(userId, bucket);
    }

    // Check if blocked
    if (bucket.blockedUntil && now < bucket.blockedUntil) return false;
    bucket.blockedUntil = null;

    // Clean old requests
    bucket.requests = bucket.requests.filter(t => now - t < this.config.windowMs);

    // Check limit
    if (bucket.requests.length >= this.config.maxRequests) {
      bucket.blockedUntil = now + this.config.blockDurationMs;
      return false;
    }

    bucket.requests.push(now);
    return true;
  }

  getStatus(userId: string): RateLimitStatus {
    const now = Date.now();
    const bucket = this.buckets.get(userId);
    if (!bucket) return { action: this.config.action, remaining: this.config.maxRequests, resetAt: now + this.config.windowMs, isBlocked: false };

    const validRequests = bucket.requests.filter(t => now - t < this.config.windowMs);
    const isBlocked = bucket.blockedUntil ? now < bucket.blockedUntil : false;
    return {
      action: this.config.action,
      remaining: Math.max(0, this.config.maxRequests - validRequests.length),
      resetAt: validRequests.length > 0 ? validRequests[0] + this.config.windowMs : now + this.config.windowMs,
      isBlocked,
      blockedUntil: bucket.blockedUntil ?? undefined,
    };
  }
}
