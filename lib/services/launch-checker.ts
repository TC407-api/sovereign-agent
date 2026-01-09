interface LaunchCheckResult {
  ready: boolean;
  failedChecks: string[];
  passedChecks: string[];
  warnings: string[];
}

interface CheckReport {
  checks: Array<{ name: string; passed: boolean; value: number | string; threshold: number | string }>;
  overallScore: number;
  ready: boolean;
  generatedAt: Date;
}

interface MetricsProvider {
  getZeroEditRate: () => Promise<number>;
  getCostEfficiency: () => Promise<number>;
  getP95Latency: () => Promise<number>;
  getTestCoverage: () => Promise<number>;
  getHealthStatus: () => Promise<{ status: string }>;
}

const THRESHOLDS = { zeroEditRate: 0.70, costEfficiency: 0.88, p95Latency: 2000, testCoverage: 0.80 };

export class LaunchReadinessChecker {
  private metrics: MetricsProvider;

  constructor(metrics: MetricsProvider) { this.metrics = metrics; }

  async checkAll(): Promise<LaunchCheckResult> {
    const failedChecks: string[] = [];
    const passedChecks: string[] = [];
    const warnings: string[] = [];

    const zeroEditRate = await this.metrics.getZeroEditRate();
    if (zeroEditRate >= THRESHOLDS.zeroEditRate) passedChecks.push('zero_edit_rate');
    else failedChecks.push('zero_edit_rate');

    const costEfficiency = await this.metrics.getCostEfficiency();
    if (costEfficiency >= THRESHOLDS.costEfficiency) passedChecks.push('cost_efficiency');
    else failedChecks.push('cost_efficiency');

    const p95Latency = await this.metrics.getP95Latency();
    if (p95Latency <= THRESHOLDS.p95Latency) passedChecks.push('p95_latency');
    else failedChecks.push('p95_latency');

    const testCoverage = await this.metrics.getTestCoverage();
    if (testCoverage >= THRESHOLDS.testCoverage) passedChecks.push('test_coverage');
    else failedChecks.push('test_coverage');

    const healthStatus = await this.metrics.getHealthStatus();
    if (healthStatus.status === 'healthy') passedChecks.push('health_status');
    else failedChecks.push('health_status');

    return { ready: failedChecks.length === 0, failedChecks, passedChecks, warnings };
  }

  async generateReport(): Promise<CheckReport> {
    const [zeroEditRate, costEfficiency, p95Latency, testCoverage, healthStatus] = await Promise.all([
      this.metrics.getZeroEditRate(),
      this.metrics.getCostEfficiency(),
      this.metrics.getP95Latency(),
      this.metrics.getTestCoverage(),
      this.metrics.getHealthStatus(),
    ]);

    const checks = [
      { name: 'zero_edit_rate', passed: zeroEditRate >= THRESHOLDS.zeroEditRate, value: zeroEditRate, threshold: THRESHOLDS.zeroEditRate },
      { name: 'cost_efficiency', passed: costEfficiency >= THRESHOLDS.costEfficiency, value: costEfficiency, threshold: THRESHOLDS.costEfficiency },
      { name: 'p95_latency', passed: p95Latency <= THRESHOLDS.p95Latency, value: p95Latency, threshold: THRESHOLDS.p95Latency },
      { name: 'test_coverage', passed: testCoverage >= THRESHOLDS.testCoverage, value: testCoverage, threshold: THRESHOLDS.testCoverage },
      { name: 'health_status', passed: healthStatus.status === 'healthy', value: healthStatus.status, threshold: 'healthy' },
    ];

    const passedCount = checks.filter(c => c.passed).length;
    return { checks, overallScore: (passedCount / checks.length) * 100, ready: passedCount === checks.length, generatedAt: new Date() };
  }
}
