import { describe, it, expect, beforeEach } from 'vitest';
import { ModelRouter } from './model-router';
import type { TaskClassification, ModelRouterConfig } from '@/lib/types/model-router';

const mockConfig: ModelRouterConfig = {
  models: [
    { id: 'llama3.3-70b', provider: 'ollama', tier: 'local', costPer1kTokens: 0, maxTokens: 8192, supportsStreaming: true, supportsTools: false },
    { id: 'gpt-4o-mini', provider: 'openai', tier: 'cheap', costPer1kTokens: 0.00015, maxTokens: 128000, supportsStreaming: true, supportsTools: true },
    { id: 'claude-3-5-sonnet', provider: 'anthropic', tier: 'standard', costPer1kTokens: 0.003, maxTokens: 200000, supportsStreaming: true, supportsTools: true },
    { id: 'claude-3-opus', provider: 'anthropic', tier: 'premium', costPer1kTokens: 0.015, maxTokens: 200000, supportsStreaming: true, supportsTools: true },
  ],
  defaultTier: 'standard',
  sensitivityRules: {
    public: ['local', 'cheap', 'standard', 'premium'],
    internal: ['local', 'cheap', 'standard'],
    confidential: ['local'],
    restricted: ['local'],
  },
};

describe('ModelRouter', () => {
  let router: ModelRouter;

  beforeEach(() => { router = new ModelRouter(mockConfig); });

  it('should route confidential data to local model', () => {
    const task: TaskClassification = { type: 'draft_email', complexity: 'medium', sensitivity: 'confidential', estimatedTokens: 500, requiresTools: false };
    const decision = router.route(task);
    expect(decision.selectedModel.tier).toBe('local');
    expect(decision.piiScrubRequired).toBe(false);
  });

  it('should route public data to cheap model for simple tasks', () => {
    const task: TaskClassification = { type: 'categorize', complexity: 'simple', sensitivity: 'public', estimatedTokens: 100, requiresTools: false };
    const decision = router.route(task);
    expect(decision.selectedModel.tier).toBe('cheap');
  });

  it('should provide fallback models', () => {
    const task: TaskClassification = { type: 'draft_email', complexity: 'medium', sensitivity: 'public', estimatedTokens: 500, requiresTools: false };
    const decision = router.route(task);
    expect(decision.fallbackModels.length).toBeGreaterThan(0);
  });

  it('should track daily cost usage', () => {
    router.recordUsage('gpt-4o-mini', 1000);
    expect(router.getDailyCost()).toBeGreaterThan(0);
  });

  it('should require PII scrub for cloud models with internal data', () => {
    const task: TaskClassification = { type: 'summarize', complexity: 'simple', sensitivity: 'internal', estimatedTokens: 500, requiresTools: false };
    const decision = router.route(task);
    if (decision.selectedModel.tier !== 'local') {
      expect(decision.piiScrubRequired).toBe(true);
    }
  });
});
