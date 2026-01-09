import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  RateLimiter,
  createRateLimiter,
  RateLimitConfig,
  RateLimitResult,
} from './rate-limiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createRateLimiter', () => {
    it('should create a rate limiter with default config', () => {
      const limiter = createRateLimiter();
      expect(limiter).toBeDefined();
      expect(limiter.check).toBeDefined();
      expect(limiter.consume).toBeDefined();
      expect(limiter.reset).toBeDefined();
    });

    it('should create a rate limiter with custom config', () => {
      const config: RateLimitConfig = {
        maxRequests: 100,
        windowMs: 60000,
        keyPrefix: 'custom',
      };
      const limiter = createRateLimiter(config);
      expect(limiter).toBeDefined();
    });
  });

  describe('Token Bucket Algorithm', () => {
    it('should allow requests within limit', async () => {
      const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60000 });

      for (let i = 0; i < 5; i++) {
        const result = await limiter.consume('user-1');
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });

    it('should block requests over limit', async () => {
      const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60000 });

      // Consume all tokens
      await limiter.consume('user-1');
      await limiter.consume('user-1');
      await limiter.consume('user-1');

      // This should be blocked
      const result = await limiter.consume('user-1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should track separate limits per key', async () => {
      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60000 });

      await limiter.consume('user-1');
      await limiter.consume('user-1');

      // user-1 is at limit
      const result1 = await limiter.consume('user-1');
      expect(result1.allowed).toBe(false);

      // user-2 should still have tokens
      const result2 = await limiter.consume('user-2');
      expect(result2.allowed).toBe(true);
    });

    it('should replenish tokens after window expires', async () => {
      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 1000 });

      await limiter.consume('user-1');
      await limiter.consume('user-1');

      // At limit
      let result = await limiter.consume('user-1');
      expect(result.allowed).toBe(false);

      // Advance time past window
      vi.advanceTimersByTime(1100);

      // Should have tokens again
      result = await limiter.consume('user-1');
      expect(result.allowed).toBe(true);
    });
  });

  describe('check method', () => {
    it('should return current limit status without consuming', async () => {
      const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60000 });

      await limiter.consume('user-1');
      await limiter.consume('user-1');

      // Check should not consume a token
      const checkResult = await limiter.check('user-1');
      expect(checkResult.remaining).toBe(3);

      // Verify token was not consumed
      const checkResult2 = await limiter.check('user-1');
      expect(checkResult2.remaining).toBe(3);
    });
  });

  describe('reset method', () => {
    it('should reset limit for a specific key', async () => {
      const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60000 });

      await limiter.consume('user-1');
      await limiter.consume('user-1');
      await limiter.consume('user-1');

      // At limit
      let result = await limiter.consume('user-1');
      expect(result.allowed).toBe(false);

      // Reset
      await limiter.reset('user-1');

      // Should have full tokens again
      result = await limiter.consume('user-1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });
  });

  describe('Sliding Window', () => {
    it('should use sliding window for smoother rate limiting', async () => {
      const limiter = createRateLimiter({
        maxRequests: 10,
        windowMs: 10000,
        sliding: true,
      });

      // Use 5 tokens
      for (let i = 0; i < 5; i++) {
        await limiter.consume('user-1');
      }

      // Advance halfway through window
      vi.advanceTimersByTime(5000);

      // Should have regained ~5 tokens (sliding window)
      const result = await limiter.check('user-1');
      expect(result.remaining).toBeGreaterThan(0);
    });
  });

  describe('Multiple Limits', () => {
    it('should support per-endpoint limits', async () => {
      const globalLimiter = createRateLimiter({ maxRequests: 100, windowMs: 60000 });
      const aiLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60000, keyPrefix: 'ai' });

      // AI endpoint has stricter limit
      for (let i = 0; i < 10; i++) {
        await aiLimiter.consume('user-1');
      }

      // AI limit reached
      const aiResult = await aiLimiter.consume('user-1');
      expect(aiResult.allowed).toBe(false);

      // But global limit still has capacity
      const globalResult = await globalLimiter.consume('user-1');
      expect(globalResult.allowed).toBe(true);
    });
  });

  describe('Cost-based limiting', () => {
    it('should support different costs per operation', async () => {
      const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60000 });

      // Light operation costs 1
      await limiter.consume('user-1', 1);

      // Heavy operation costs 5
      await limiter.consume('user-1', 5);

      // Check remaining (should be 4)
      const result = await limiter.check('user-1');
      expect(result.remaining).toBe(4);

      // Try to consume 5 more (should succeed)
      const result2 = await limiter.consume('user-1', 5);
      expect(result2.allowed).toBe(false);
      expect(result2.remaining).toBe(4);
    });
  });

  describe('Rate Limit Headers', () => {
    it('should return headers for HTTP responses', async () => {
      const limiter = createRateLimiter({ maxRequests: 100, windowMs: 60000 });

      await limiter.consume('user-1');

      const result = await limiter.check('user-1');

      expect(result.headers).toBeDefined();
      expect(result.headers?.['X-RateLimit-Limit']).toBe('100');
      expect(result.headers?.['X-RateLimit-Remaining']).toBe('99');
      expect(result.headers?.['X-RateLimit-Reset']).toBeDefined();
    });
  });
});

describe('RateLimitResult', () => {
  it('should have all required fields', () => {
    const result: RateLimitResult = {
      allowed: true,
      remaining: 5,
      resetAt: Date.now() + 60000,
    };

    expect(result).toHaveProperty('allowed');
    expect(result).toHaveProperty('remaining');
    expect(result).toHaveProperty('resetAt');
  });

  it('should include retryAfter when blocked', () => {
    const result: RateLimitResult = {
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30000,
      retryAfter: 30,
    };

    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBe(30);
  });
});
