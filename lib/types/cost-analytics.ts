export interface CostEntry {
  id: string;
  modelId: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  actionType: string;
  timestamp: Date;
}

export interface CostSummary {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalCost: number;
  totalTokens: number;
  requestCount: number;
}

export interface CostByModel {
  modelId: string;
  modelName: string;
  provider: string;
  cost: number;
  percentage: number;
  requestCount: number;
}

export interface CostByAction {
  actionType: string;
  cost: number;
  percentage: number;
  requestCount: number;
  avgCostPerRequest: number;
}

export interface CostProjection {
  currentMonthSpend: number;
  projectedMonthSpend: number;
  budgetLimit: number;
  percentUsed: number;
  daysRemaining: number;
}

export type CostTrend = 'increasing' | 'decreasing' | 'stable';

export interface CostAnalytics {
  summary: CostSummary;
  byModel: CostByModel[];
  byAction: CostByAction[];
  projection: CostProjection;
  trend: CostTrend;
}
