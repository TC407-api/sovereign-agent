export type ModerationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ModerationAction = 'allow' | 'warn' | 'block' | 'quarantine';

export interface ModerationViolation {
  rule: string;
  severity: ModerationSeverity;
  details: string;
  matchedContent?: string;
}

export interface ModerationResult {
  id: string;
  contentId: string;
  passed: boolean;
  violations: ModerationViolation[];
  scannedAt: number;
}

export interface ModerationRule {
  id: string;
  name: string;
  pattern: RegExp | string;
  severity: ModerationSeverity;
  action: ModerationAction;
  description?: string;
}

export interface BlockedContent {
  id: string;
  contentId: string;
  reason: string;
  blockedAt: number;
  overrideAllowed: boolean;
}

export interface ModerationOverride {
  id: string;
  blockedContentId: string;
  userId: string;
  reason: string;
  overriddenAt: number;
}
