/**
 * Rate Limiter - Token bucket algorithm with sliding window support
 *
 * Protects API endpoints from abuse with configurable limits
 * per user, endpoint, or custom keys.
 */

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional key prefix for namespacing */
  keyPrefix?: string;
  /** Use sliding window algorithm for smoother limiting */
  sliding?: boolean;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Timestamp when the limit resets */
  resetAt: number;
  /** Seconds until the limit resets (only if blocked) */
  retryAfter?: number;
  /** HTTP headers for the response */
  headers?: Record<string, string>;
}

export interface RateLimiter {
  /** Check the current limit without consuming a token */
  check(key: string): Promise<RateLimitResult>;
  /** Consume tokens from the bucket */
  consume(key: string, cost?: number): Promise<RateLimitResult>;
  /** Reset the limit for a specific key */
  reset(key: string): Promise<void>;
}

interface BucketState {
  tokens: number;
  lastRefill: number;
  windowStart: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60000, // 1 minute
  sliding: false,
};

/**
 * Create a new rate limiter instance
 */
export function createRateLimiter(config: Partial<RateLimitConfig> = {}): RateLimiter {
  const mergedConfig: RateLimitConfig = { ...DEFAULT_CONFIG, ...config };
  const buckets = new Map<string, BucketState>();

  function getFullKey(key: string): string {
    return mergedConfig.keyPrefix ? `${mergedConfig.keyPrefix}:${key}` : key;
  }

  function getBucket(key: string): BucketState {
    const fullKey = getFullKey(key);
    const now = Date.now();

    let bucket = buckets.get(fullKey);

    if (!bucket) {
      bucket = {
        tokens: mergedConfig.maxRequests,
        lastRefill: now,
        windowStart: now,
      };
      buckets.set(fullKey, bucket);
      return bucket;
    }

    // Refill tokens based on time passed
    const timePassed = now - bucket.lastRefill;

    if (mergedConfig.sliding) {
      // Sliding window: gradually refill tokens
      const tokensToAdd = (timePassed / mergedConfig.windowMs) * mergedConfig.maxRequests;
      bucket.tokens = Math.min(mergedConfig.maxRequests, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    } else {
      // Fixed window: reset if window has passed
      if (timePassed >= mergedConfig.windowMs) {
        bucket.tokens = mergedConfig.maxRequests;
        bucket.lastRefill = now;
        bucket.windowStart = now;
      }
    }

    return bucket;
  }

  function calculateResetAt(bucket: BucketState): number {
    if (mergedConfig.sliding) {
      // For sliding window, estimate when we'll have tokens again
      return bucket.lastRefill + mergedConfig.windowMs;
    }
    return bucket.windowStart + mergedConfig.windowMs;
  }

  function buildHeaders(remaining: number, resetAt: number): Record<string, string> {
    return {
      'X-RateLimit-Limit': String(mergedConfig.maxRequests),
      'X-RateLimit-Remaining': String(Math.max(0, remaining)),
      'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
    };
  }

  async function check(key: string): Promise<RateLimitResult> {
    const bucket = getBucket(key);
    const resetAt = calculateResetAt(bucket);
    const remaining = Math.floor(bucket.tokens);

    return {
      allowed: remaining > 0,
      remaining,
      resetAt,
      headers: buildHeaders(remaining, resetAt),
    };
  }

  async function consume(key: string, cost: number = 1): Promise<RateLimitResult> {
    const bucket = getBucket(key);
    const resetAt = calculateResetAt(bucket);
    const remaining = Math.floor(bucket.tokens);

    // Check if we have enough tokens
    if (remaining < cost) {
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
      return {
        allowed: false,
        remaining: Math.max(0, remaining),
        resetAt,
        retryAfter: Math.max(1, retryAfter),
        headers: buildHeaders(remaining, resetAt),
      };
    }

    // Consume tokens
    bucket.tokens -= cost;

    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetAt,
      headers: buildHeaders(Math.floor(bucket.tokens), resetAt),
    };
  }

  async function reset(key: string): Promise<void> {
    const fullKey = getFullKey(key);
    const now = Date.now();
    buckets.set(fullKey, {
      tokens: mergedConfig.maxRequests,
      lastRefill: now,
      windowStart: now,
    });
  }

  return {
    check,
    consume,
    reset,
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  /** Global API limit: 100 requests per minute */
  global: () => createRateLimiter({ maxRequests: 100, windowMs: 60000 }),

  /** AI operations: 20 requests per minute (more expensive) */
  ai: () => createRateLimiter({ maxRequests: 20, windowMs: 60000, keyPrefix: 'ai' }),

  /** Email sending: 10 per minute to prevent spam */
  email: () => createRateLimiter({ maxRequests: 10, windowMs: 60000, keyPrefix: 'email' }),

  /** Authentication attempts: 5 per minute */
  auth: () => createRateLimiter({ maxRequests: 5, windowMs: 60000, keyPrefix: 'auth' }),

  /** Strict burst protection: 3 per second */
  burst: () => createRateLimiter({ maxRequests: 3, windowMs: 1000, keyPrefix: 'burst' }),
};
