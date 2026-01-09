export type ModelTier = 'local' | 'cheap' | 'standard' | 'premium';
export type ModelProvider = 'ollama' | 'openai' | 'anthropic' | 'google';
export type SensitivityLevel = 'public' | 'internal' | 'confidential' | 'restricted';
export type TaskComplexity = 'simple' | 'medium' | 'complex' | 'expert';

export interface ModelConfig {
  id: string;
  provider: ModelProvider;
  tier: ModelTier;
  costPer1kTokens: number;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsTools: boolean;
}

export interface TaskClassification {
  type: string;
  complexity: TaskComplexity;
  sensitivity: SensitivityLevel;
  estimatedTokens: number;
  requiresTools: boolean;
}

export interface RoutingDecision {
  selectedModel: ModelConfig;
  reason: string;
  fallbackModels: ModelConfig[];
  piiScrubRequired: boolean;
}

export interface ModelRouterConfig {
  models: ModelConfig[];
  defaultTier: ModelTier;
  sensitivityRules: Record<SensitivityLevel, ModelTier[]>;
  costBudget?: { daily: number; monthly: number };
}
