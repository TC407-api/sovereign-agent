'use client';

import React from 'react';

interface StreamingPrepCardData {
  name: string;
  email: string;
  interactionLevel: 'low' | 'medium' | 'high';
  commonTopics: string[];
  recentThreadCount: number;
}

interface StreamingPrepCardProps {
  isLoading?: boolean;
  isStreaming?: boolean;
  data?: StreamingPrepCardData;
}

function Skeleton() {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white max-w-md animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-200 rounded w-40" />
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16" />
      </div>
      <div className="mb-4">
        <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>
      </div>
      <div className="pt-3 border-t">
        <div className="h-4 bg-gray-200 rounded w-28" />
      </div>
    </div>
  );
}

export function StreamingPrepCard({
  isLoading = false,
  isStreaming = false,
  data,
}: StreamingPrepCardProps) {
  if (isLoading) {
    return <Skeleton />;
  }

  if (!data) {
    return null;
  }

  const badgeColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-green-100 text-green-800',
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white max-w-md relative">
      {isStreaming && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-blue-600">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Streaming...
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{data.name}</h3>
          <p className="text-sm text-gray-500">{data.email}</p>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            badgeColors[data.interactionLevel]
          }`}
        >
          {data.interactionLevel}
        </span>
      </div>

      {data.commonTopics.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Common Topics
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.commonTopics.map((topic) => (
              <span
                key={topic}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.recentThreadCount > 0 && (
        <div className="pt-3 border-t">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{data.recentThreadCount}</span> recent threads
          </p>
        </div>
      )}
    </div>
  );
}
