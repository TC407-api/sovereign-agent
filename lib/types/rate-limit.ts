export interface RateLimitConfig {
  action: string;
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
  description?: string;
}

export interface RateLimitStatus {
  action: string;
  remaining: number;
  resetAt: number;
  isBlocked: boolean;
  blockedUntil?: number;
}

export interface RateLimitBucket {
  userId: string;
  action: string;
  requests: number[];
  blockedUntil: number | null;
}

export interface RateLimitViolation {
  id: string;
  userId: string;
  action: string;
  attemptedAt: number;
  blockedUntil: number;
}

export const DEFAULT_LIMITS: RateLimitConfig[] = [
  { action: 'send_email', maxRequests: 10, windowMs: 60000, blockDurationMs: 300000 },
  { action: 'delete_email', maxRequests: 5, windowMs: 60000, blockDurationMs: 600000 },
  { action: 'generate_draft', maxRequests: 20, windowMs: 60000, blockDurationMs: 120000 },
];
