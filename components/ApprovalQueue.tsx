'use client';

import React from 'react';
import type { ApprovalRequest } from '@/lib/types/approval';

interface ApprovalQueueProps {
  requests: ApprovalRequest[];
  onSelect: (request: ApprovalRequest) => void;
}

export function ApprovalQueue({ requests, onSelect }: ApprovalQueueProps) {
  const sorted = [...requests].sort((a, b) => a.expiresAt - b.expiresAt);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (requests.length === 0) {
    return <div className="p-4 text-gray-500">No pending approvals</div>;
  }

  return (
    <div className="border rounded-lg">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold">Pending Approvals</h3>
        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">{pendingCount}</span>
      </div>
      <ul>
        {sorted.map((request) => (
          <li
            key={request.id}
            role="listitem"
            onClick={() => onSelect(request)}
            className="p-3 border-b cursor-pointer hover:bg-gray-50"
          >
            <p className="font-medium">{request.action}</p>
            <p className="text-sm text-gray-500">{request.reason}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
