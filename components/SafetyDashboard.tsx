'use client';

import React from 'react';
import type { ApprovalRequest } from '@/lib/types/approval';
import type { AuditEntry } from '@/lib/types/audit';
import type { RateLimitStatus } from '@/lib/types/rate-limit';

interface SafetyDashboardProps {
  pendingApprovals: ApprovalRequest[];
  recentAuditEntries: AuditEntry[];
  rateLimitStatus: RateLimitStatus | null;
}

export function SafetyDashboard({ pendingApprovals, recentAuditEntries, rateLimitStatus }: SafetyDashboardProps) {
  const isEmpty = pendingApprovals.length === 0 && recentAuditEntries.length === 0 && !rateLimitStatus;

  if (isEmpty) {
    return <div className="p-6 text-center text-gray-500">All clear - no pending items</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Pending Approvals</h3>
          {pendingApprovals.length > 0 && <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">{pendingApprovals.length}</span>}
        </div>
        {pendingApprovals.length === 0 ? <p className="text-gray-500">None</p> : (
          <ul>{pendingApprovals.map(a => <li key={a.id} className="text-sm">{a.action}</li>)}</ul>
        )}
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Audit Trail</h3>
        {recentAuditEntries.length === 0 ? <p className="text-gray-500">No recent activity</p> : (
          <ul>{recentAuditEntries.slice(0, 5).map(e => <li key={e.id} className="text-sm">{e.action}</li>)}</ul>
        )}
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Rate Limits</h3>
        {rateLimitStatus ? (
          <div><p className="text-sm">{rateLimitStatus.remaining} remaining</p><p className="text-xs text-gray-500">{rateLimitStatus.action}</p></div>
        ) : <p className="text-gray-500">Not configured</p>}
      </div>
    </div>
  );
}
