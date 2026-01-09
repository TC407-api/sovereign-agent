export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 's' | 'count' | 'percent' | 'bytes';
  timestamp: number;
  tags?: Record<string, string>;
}

export interface LatencyBucket {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  max: number;
}

export interface ThroughputStats {
  requestsPerMinute: number;
  requestsPerHour: number;
  peakRpm: number;
  peakTime: Date;
}

export interface ErrorStats {
  totalErrors: number;
  errorRate: number;
  errorsByType: Record<string, number>;
}

export interface HealthCheck {
  healthy: boolean;
  latencyMs: number;
  error?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, HealthCheck>;
  lastCheck: number;
}

export interface PerformanceDashboard {
  latency: LatencyBucket;
  throughput: ThroughputStats;
  errors: ErrorStats;
  health: HealthStatus;
  period: 'last_hour' | 'last_day' | 'last_week';
}
