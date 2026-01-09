import { describe, it, expect } from 'vitest';
import type { PerformanceMetric, LatencyBucket, ThroughputStats, ErrorStats, HealthStatus, PerformanceDashboard } from './performance';

describe('Performance Types', () => {
  it('should define performance metric', () => {
    const metric: PerformanceMetric = { name: 'api_response_time', value: 245, unit: 'ms', timestamp: Date.now(), tags: { endpoint: '/api/draft', method: 'POST' } };
    expect(metric.unit).toBe('ms');
  });

  it('should define latency buckets', () => {
    const bucket: LatencyBucket = { p50: 150, p90: 350, p95: 500, p99: 1200, max: 2500 };
    expect(bucket.p95).toBe(500);
  });

  it('should define throughput stats', () => {
    const throughput: ThroughputStats = { requestsPerMinute: 120, requestsPerHour: 7200, peakRpm: 250, peakTime: new Date('2026-01-08T14:00:00') };
    expect(throughput.requestsPerMinute).toBe(120);
  });

  it('should define error stats', () => {
    const errors: ErrorStats = { totalErrors: 15, errorRate: 0.02, errorsByType: { timeout: 8, rate_limit: 5, server_error: 2 } };
    expect(errors.errorRate).toBe(0.02);
  });

  it('should define health status', () => {
    const health: HealthStatus = { status: 'healthy', checks: { database: { healthy: true, latencyMs: 5 }, ai_api: { healthy: true, latencyMs: 150 } }, lastCheck: Date.now() };
    expect(health.status).toBe('healthy');
  });

  it('should define performance dashboard', () => {
    const dashboard: PerformanceDashboard = {
      latency: { p50: 150, p90: 350, p95: 500, p99: 1200, max: 2500 },
      throughput: { requestsPerMinute: 120, requestsPerHour: 7200, peakRpm: 250, peakTime: new Date() },
      errors: { totalErrors: 15, errorRate: 0.02, errorsByType: {} },
      health: { status: 'healthy', checks: {}, lastCheck: Date.now() },
      period: 'last_hour',
    };
    expect(dashboard.period).toBe('last_hour');
  });
});
