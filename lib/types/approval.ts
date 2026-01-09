export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'auto_approved';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ActionType = 'send_email' | 'delete_email' | 'archive_email' | 'forward_email' | 'schedule_meeting' | 'cancel_meeting' | 'add_label' | 'remove_label';

export interface ApprovalRequest {
  id: string;
  userId: string;
  action: ActionType | string;
  payload: Record<string, unknown>;
  reason: string;
  status: ApprovalStatus;
  createdAt: number;
  expiresAt: number;
  metadata?: Record<string, unknown>;
}

export interface ApprovalDecision {
  requestId: string;
  decision: 'approved' | 'rejected';
  decidedBy: string;
  decidedAt: number;
  comment?: string;
}

export interface SensitiveAction {
  type: ActionType | string;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  timeout: number;
  conditions?: Array<{ field: string; operator: string; value: unknown }>;
}

export interface ApprovalPolicy {
  userId: string;
  autoApprove: string[];
  alwaysApprove: string[];
  timeout: number;
  notifyVia: ('push' | 'email' | 'sms')[];
}

export const SENSITIVE_ACTIONS: SensitiveAction[] = [
  { type: 'send_email', riskLevel: 'high', requiresApproval: true, timeout: 30000 },
  { type: 'delete_email', riskLevel: 'critical', requiresApproval: true, timeout: 60000 },
  { type: 'archive_email', riskLevel: 'low', requiresApproval: false, timeout: 0 },
];
