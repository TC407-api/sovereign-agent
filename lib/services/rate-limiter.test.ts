import { describe, expect, test, vi, beforeEach } from 'vitest';
import { RateLimiter } from './rate-limiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({ action: 'send_email', maxRequests: 3, windowMs: 60000, blockDurationMs: 300000 });
  });

  test('allows requests within limit', () => {
    expect(limiter.tryAcquire('user-1')).toBe(true);
    expect(limiter.tryAcquire('user-1')).toBe(true);
    expect(limiter.tryAcquire('user-1')).toBe(true);
  });

  test('blocks requests over limit', () => {
    limiter.tryAcquire('user-1');
    limiter.tryAcquire('user-1');
    limiter.tryAcquire('user-1');
    expect(limiter.tryAcquire('user-1')).toBe(false);
  });

  test('returns current status', () => {
    limiter.tryAcquire('user-1');
    const status = limiter.getStatus('user-1');
    expect(status.remaining).toBe(2);
    expect(status.isBlocked).toBe(false);
  });

  test('tracks separate users', () => {
    limiter.tryAcquire('user-1');
    limiter.tryAcquire('user-1');
    limiter.tryAcquire('user-1');
    expect(limiter.tryAcquire('user-2')).toBe(true);
  });

  test('resets after block duration expires', () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    limiter.tryAcquire('user-1');
    limiter.tryAcquire('user-1');
    limiter.tryAcquire('user-1');
    expect(limiter.tryAcquire('user-1')).toBe(false);

    // Block duration is 300000ms, need to advance past that
    vi.setSystemTime(now + 300001);
    expect(limiter.tryAcquire('user-1')).toBe(true);
    vi.useRealTimers();
  });
});
