import { describe, expect, test } from 'vitest';
import type {
  ApprovalRequest,
  ApprovalStatus,
  ApprovalDecision,
  SensitiveAction,
  ApprovalPolicy,
} from './approval';

describe('Approval Types', () => {
  test('ApprovalRequest captures pending action', () => {
    const request: ApprovalRequest = {
      id: 'apr-123',
      userId: 'user-1',
      action: 'send_email',
      payload: { to: 'ceo@company.com', subject: 'Important' },
      reason: 'Email to VIP contact requires approval',
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 30000,
    };
    expect(request.status).toBe('pending');
    expect(request.expiresAt).toBeGreaterThan(request.createdAt);
  });

  test('ApprovalDecision records user choice', () => {
    const decision: ApprovalDecision = {
      requestId: 'apr-123',
      decision: 'approved',
      decidedBy: 'user-1',
      decidedAt: Date.now(),
      comment: 'Looks good',
    };
    expect(decision.decision).toBe('approved');
  });

  test('SensitiveAction defines what needs approval', () => {
    const action: SensitiveAction = {
      type: 'send_email',
      riskLevel: 'high',
      requiresApproval: true,
      timeout: 30000,
    };
    expect(action.requiresApproval).toBe(true);
    expect(action.riskLevel).toBe('high');
  });

  test('ApprovalPolicy configures user preferences', () => {
    const policy: ApprovalPolicy = {
      userId: 'user-1',
      autoApprove: ['archive', 'label'],
      alwaysApprove: ['send_email', 'delete'],
      timeout: 60000,
      notifyVia: ['push', 'email'],
    };
    expect(policy.autoApprove).toContain('archive');
    expect(policy.alwaysApprove).toContain('send_email');
  });
});
