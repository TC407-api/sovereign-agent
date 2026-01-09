import { describe, it, expect } from 'vitest';
import type { ModelTier, ModelProvider, ModelConfig, RoutingDecision, TaskClassification, SensitivityLevel, ModelRouterConfig } from './model-router';

describe('Model Router Types', () => {
  it('should define model tiers', () => {
    const tiers: ModelTier[] = ['local', 'cheap', 'standard', 'premium'];
    expect(tiers).toHaveLength(4);
  });

  it('should define model providers', () => {
    const providers: ModelProvider[] = ['ollama', 'openai', 'anthropic', 'google'];
    expect(providers).toHaveLength(4);
  });

  it('should define model configuration', () => {
    const config: ModelConfig = { id: 'gpt-4o-mini', provider: 'openai', tier: 'cheap', costPer1kTokens: 0.00015, maxTokens: 128000, supportsStreaming: true, supportsTools: true };
    expect(config.tier).toBe('cheap');
  });

  it('should define sensitivity levels', () => {
    const levels: SensitivityLevel[] = ['public', 'internal', 'confidential', 'restricted'];
    expect(levels).toHaveLength(4);
  });

  it('should define task classification', () => {
    const task: TaskClassification = { type: 'draft_email', complexity: 'medium', sensitivity: 'confidential', estimatedTokens: 500, requiresTools: false };
    expect(task.sensitivity).toBe('confidential');
  });

  it('should define routing decision', () => {
    const decision: RoutingDecision = {
      selectedModel: { id: 'llama3.3-70b', provider: 'ollama', tier: 'local', costPer1kTokens: 0, maxTokens: 8192, supportsStreaming: true, supportsTools: false },
      reason: 'Confidential data - using local model',
      fallbackModels: [],
      piiScrubRequired: false,
    };
    expect(decision.piiScrubRequired).toBe(false);
  });
});
