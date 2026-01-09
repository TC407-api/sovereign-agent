import type { ModelConfig, ModelRouterConfig, TaskClassification, RoutingDecision, ModelTier } from '@/lib/types/model-router';

const COMPLEXITY_TO_TIER: Record<string, ModelTier> = {
  simple: 'cheap',
  medium: 'standard',
  complex: 'standard',
  expert: 'premium',
};

export class ModelRouter {
  private config: ModelRouterConfig;
  private dailyCost = 0;
  private monthlyCost = 0;

  constructor(config: ModelRouterConfig) {
    this.config = config;
  }

  route(task: TaskClassification): RoutingDecision {
    const allowedTiers = this.config.sensitivityRules[task.sensitivity];
    const preferredTier = COMPLEXITY_TO_TIER[task.complexity] || this.config.defaultTier;
    const effectiveTier = this.applyBudgetConstraints(preferredTier);
    const selectedModel = this.findBestModel(task, allowedTiers, effectiveTier);
    const fallbackModels = this.getFallbackModels(selectedModel, allowedTiers);
    const piiScrubRequired = task.sensitivity !== 'public' && selectedModel.tier !== 'local';
    return { selectedModel, reason: this.getRoutingReason(task, selectedModel), fallbackModels, piiScrubRequired };
  }

  private findBestModel(task: TaskClassification, allowedTiers: ModelTier[], preferredTier: ModelTier): ModelConfig {
    const candidates = this.config.models.filter(m => allowedTiers.includes(m.tier));
    if (task.requiresTools) {
      const toolModels = candidates.filter(m => m.supportsTools);
      if (toolModels.length > 0) {
        return toolModels.find(m => m.tier === preferredTier) || toolModels[0];
      }
    }
    return candidates.find(m => m.tier === preferredTier) || candidates[0];
  }

  private getFallbackModels(selected: ModelConfig, allowedTiers: ModelTier[]): ModelConfig[] {
    return this.config.models.filter(m => m.id !== selected.id && allowedTiers.includes(m.tier)).slice(0, 2);
  }

  private applyBudgetConstraints(preferredTier: ModelTier): ModelTier {
    if (!this.config.costBudget) return preferredTier;
    if (this.dailyCost >= this.config.costBudget.daily) return 'cheap';
    return preferredTier;
  }

  private getRoutingReason(task: TaskClassification, model: ModelConfig): string {
    if ((task.sensitivity === 'confidential' || task.sensitivity === 'restricted') && model.tier === 'local') {
      return `${task.sensitivity} data - using local model`;
    }
    return `${task.complexity} task - using ${model.tier} tier`;
  }

  recordUsage(modelId: string, tokens: number): void {
    const model = this.config.models.find(m => m.id === modelId);
    if (model) {
      const cost = (tokens / 1000) * model.costPer1kTokens;
      this.dailyCost += cost;
      this.monthlyCost += cost;
    }
  }

  getDailyCost(): number { return this.dailyCost; }
}
