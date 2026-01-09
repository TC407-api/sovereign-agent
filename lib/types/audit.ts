export type AuditEventType = 'action_requested' | 'action_executed' | 'approval_requested' | 'approval_decided' | 'error_occurred' | 'draft_generated' | 'draft_modified';

export interface AuditEntry {
  id: string;
  timestamp: number;
  userId: string;
  eventType: AuditEventType;
  action: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: { message: string; code?: string; stack?: string };
  durationMs: number;
  metadata?: Record<string, unknown>;
}

export interface ChainOfThoughtStep {
  step: number;
  reasoning: string;
  confidence: number;
  timestamp?: number;
}

export interface ChainOfThought {
  id: string;
  auditEntryId: string;
  steps: ChainOfThoughtStep[];
}
