import { describe, expect, test } from 'vitest';
import type { RateLimitConfig, RateLimitStatus, RateLimitBucket, RateLimitViolation } from './rate-limit';

describe('Rate Limit Types', () => {
  test('RateLimitConfig defines limits', () => {
    const config: RateLimitConfig = {
      action: 'send_email',
      maxRequests: 10,
      windowMs: 60000,
      blockDurationMs: 300000,
    };
    expect(config.maxRequests).toBe(10);
  });

  test('RateLimitStatus tracks current usage', () => {
    const status: RateLimitStatus = {
      action: 'send_email',
      remaining: 5,
      resetAt: Date.now() + 30000,
      isBlocked: false,
    };
    expect(status.remaining).toBe(5);
    expect(status.isBlocked).toBe(false);
  });

  test('RateLimitBucket stores request history', () => {
    const bucket: RateLimitBucket = {
      userId: 'user-1',
      action: 'send_email',
      requests: [Date.now() - 5000, Date.now()],
      blockedUntil: null,
    };
    expect(bucket.requests).toHaveLength(2);
  });

  test('RateLimitViolation records breach', () => {
    const violation: RateLimitViolation = {
      id: 'rlv-123',
      userId: 'user-1',
      action: 'send_email',
      attemptedAt: Date.now(),
      blockedUntil: Date.now() + 300000,
    };
    expect(violation.blockedUntil).toBeGreaterThan(violation.attemptedAt);
  });
});
