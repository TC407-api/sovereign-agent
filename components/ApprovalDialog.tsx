'use client';

import React from 'react';
import type { ApprovalRequest } from '@/lib/types/approval';

interface ApprovalDialogProps {
  request: ApprovalRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ApprovalDialog({ request, onApprove, onReject }: ApprovalDialogProps) {
  const timeLeft = Math.max(0, request.expiresAt - Date.now());
  const seconds = Math.ceil(timeLeft / 1000);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold mb-4">Approval Required</h2>
        <div className="mb-4">
          <p className="text-gray-600">Action: <span className="font-medium">{request.action}</span></p>
          <p className="text-gray-600 mt-2">{request.reason}</p>
        </div>
        <div className="bg-gray-50 rounded p-3 mb-4 overflow-auto max-h-48">
          <pre className="text-xs font-mono whitespace-pre-wrap break-all">
            {JSON.stringify(request.payload, null, 2)}
          </pre>
        </div>
        <p className="text-sm text-gray-500 mb-4">Expires in {seconds}s</p>
        <div className="flex gap-3">
          <button
            onClick={() => onReject(request.id)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={() => onApprove(request.id)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
