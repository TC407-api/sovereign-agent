'use client';

import React, { useState } from 'react';
import type { AuditEntry } from '@/lib/types/audit';

interface AuditTrailProps {
  entries: AuditEntry[];
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function AuditTrail({ entries }: AuditTrailProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (entries.length === 0) {
    return <div className="p-4 text-gray-500">No activity yet</div>;
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="border rounded p-3 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
        >
          <div className="flex justify-between items-start">
            <span className="font-medium">{entry.action}</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono uppercase">
              {entry.eventType}
            </span>
          </div>
          <p className="text-sm text-gray-500">{formatTimeAgo(entry.timestamp)}</p>
          {expanded === entry.id && (
            <div className="mt-2 pt-2 border-t text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-mono">{entry.durationMs}ms</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
