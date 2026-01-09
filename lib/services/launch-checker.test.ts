import { describe, it, expect, vi } from 'vitest';
import { LaunchReadinessChecker } from './launch-checker';

describe('LaunchReadinessChecker', () => {
  describe('checkAll', () => {
    it('should pass when all criteria met', async () => {
      const checker = new LaunchReadinessChecker({
        getZeroEditRate: vi.fn().mockResolvedValue(0.72),
        getCostEfficiency: vi.fn().mockResolvedValue(0.90),
        getP95Latency: vi.fn().mockResolvedValue(1800),
        getTestCoverage: vi.fn().mockResolvedValue(0.85),
        getHealthStatus: vi.fn().mockResolvedValue({ status: 'healthy' }),
      });
      const result = await checker.checkAll();
      expect(result.ready).toBe(true);
      expect(result.failedChecks).toHaveLength(0);
    });

    it('should fail when Zero-Edit Rate below threshold', async () => {
      const checker = new LaunchReadinessChecker({
        getZeroEditRate: vi.fn().mockResolvedValue(0.55),
        getCostEfficiency: vi.fn().mockResolvedValue(0.90),
        getP95Latency: vi.fn().mockResolvedValue(1800),
        getTestCoverage: vi.fn().mockResolvedValue(0.85),
        getHealthStatus: vi.fn().mockResolvedValue({ status: 'healthy' }),
      });
      const result = await checker.checkAll();
      expect(result.ready).toBe(false);
      expect(result.failedChecks).toContain('zero_edit_rate');
    });

    it('should fail when P95 latency exceeds threshold', async () => {
      const checker = new LaunchReadinessChecker({
        getZeroEditRate: vi.fn().mockResolvedValue(0.72),
        getCostEfficiency: vi.fn().mockResolvedValue(0.90),
        getP95Latency: vi.fn().mockResolvedValue(3500),
        getTestCoverage: vi.fn().mockResolvedValue(0.85),
        getHealthStatus: vi.fn().mockResolvedValue({ status: 'healthy' }),
      });
      const result = await checker.checkAll();
      expect(result.ready).toBe(false);
      expect(result.failedChecks).toContain('p95_latency');
    });

    it('should fail when health status is unhealthy', async () => {
      const checker = new LaunchReadinessChecker({
        getZeroEditRate: vi.fn().mockResolvedValue(0.72),
        getCostEfficiency: vi.fn().mockResolvedValue(0.90),
        getP95Latency: vi.fn().mockResolvedValue(1800),
        getTestCoverage: vi.fn().mockResolvedValue(0.85),
        getHealthStatus: vi.fn().mockResolvedValue({ status: 'unhealthy' }),
      });
      const result = await checker.checkAll();
      expect(result.ready).toBe(false);
      expect(result.failedChecks).toContain('health_status');
    });
  });

  describe('generateReport', () => {
    it('should generate detailed report', async () => {
      const checker = new LaunchReadinessChecker({
        getZeroEditRate: vi.fn().mockResolvedValue(0.72),
        getCostEfficiency: vi.fn().mockResolvedValue(0.90),
        getP95Latency: vi.fn().mockResolvedValue(1800),
        getTestCoverage: vi.fn().mockResolvedValue(0.85),
        getHealthStatus: vi.fn().mockResolvedValue({ status: 'healthy' }),
      });
      const report = await checker.generateReport();
      expect(report.checks).toHaveLength(5);
      expect(report.overallScore).toBeGreaterThan(0);
    });
  });
});
