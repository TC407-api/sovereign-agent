'use client';

import React from 'react';
import type { CalendarConflict, AlternativeSlot } from '@/lib/types/calendar';

interface ConflictDetectorProps {
  conflicts: CalendarConflict[];
  alternatives: AlternativeSlot[];
  isLoading: boolean;
}

export function ConflictDetector({
  conflicts,
  alternatives,
  isLoading,
}: ConflictDetectorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 border rounded-lg bg-gray-50">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3" />
        <span className="text-sm font-medium text-gray-600">
          Checking calendar availability...
        </span>
      </div>
    );
  }

  const hasConflicts = conflicts.length > 0;

  if (!hasConflicts) {
    return (
      <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-green-600 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-green-800">No conflicts found</h3>
            <p className="text-sm text-green-700">
              The time slot is available for scheduling.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Conflict Warning */}
      <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
        <div className="flex items-center mb-3 text-amber-800">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="font-semibold text-lg">Schedule Conflict Detected</h3>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-amber-700 font-medium">
            Overlapping events:
          </p>
          {conflicts.map((conflict) => (
            <div
              key={conflict.eventId}
              className="text-sm bg-white/50 p-3 rounded border border-amber-100"
            >
              <span className="font-bold text-amber-900">{conflict.title}</span>
              <div className="text-xs text-amber-600 mt-1">
                {formatTime(conflict.start)} - {formatTime(conflict.end)}
              </div>
              {conflict.severity === 'hard' && (
                <span className="inline-block mt-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                  Cannot be moved
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Alternative Slots */}
        {alternatives.length > 0 && (
          <div className="mt-4 pt-4 border-t border-amber-200">
            <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Suggested Alternative Times
            </h4>
            <div className="space-y-2">
              {alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-white p-3 rounded border border-amber-200 text-sm"
                >
                  <span className="text-gray-700">
                    {formatTime(alt.start)} - {formatTime(alt.end)}
                  </span>
                  <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {Math.round(alt.score * 100)}% match
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
