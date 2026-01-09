import { describe, it, expect } from 'vitest';
import type { CostEntry, CostSummary, CostByModel, CostByAction, CostProjection, CostAnalytics, CostTrend } from './cost-analytics';

describe('Cost Analytics Types', () => {
  it('should define cost entry', () => {
    const entry: CostEntry = { id: 'cost-1', modelId: 'gpt-4o-mini', provider: 'openai', inputTokens: 500, outputTokens: 200, cost: 0.000105, actionType: 'draft_email', timestamp: new Date('2026-01-08') };
    expect(entry.cost).toBeLessThan(1);
  });

  it('should define cost summary', () => {
    const summary: CostSummary = { period: 'daily', startDate: new Date('2026-01-08'), endDate: new Date('2026-01-08'), totalCost: 1.25, totalTokens: 50000, requestCount: 100 };
    expect(summary.period).toBe('daily');
  });

  it('should define cost by model breakdown', () => {
    const byModel: CostByModel = { modelId: 'claude-3-5-sonnet', modelName: 'Claude 3.5 Sonnet', provider: 'anthropic', cost: 0.75, percentage: 60, requestCount: 50 };
    expect(byModel.percentage).toBe(60);
  });

  it('should define cost by action breakdown', () => {
    const byAction: CostByAction = { actionType: 'draft_email', cost: 0.50, percentage: 40, requestCount: 25, avgCostPerRequest: 0.02 };
    expect(byAction.avgCostPerRequest).toBe(0.02);
  });

  it('should define cost projection', () => {
    const projection: CostProjection = { currentMonthSpend: 15.50, projectedMonthSpend: 45.00, budgetLimit: 50.00, percentUsed: 31, daysRemaining: 23 };
    expect(projection.percentUsed).toBe(31);
  });

  it('should define full analytics', () => {
    const analytics: CostAnalytics = {
      summary: { period: 'monthly', startDate: new Date('2026-01-01'), endDate: new Date('2026-01-31'), totalCost: 45.00, totalTokens: 2000000, requestCount: 1500 },
      byModel: [],
      byAction: [],
      projection: { currentMonthSpend: 45.00, projectedMonthSpend: 45.00, budgetLimit: 100.00, percentUsed: 45, daysRemaining: 0 },
      trend: 'stable',
    };
    expect(analytics.trend).toBe('stable');
  });
});
