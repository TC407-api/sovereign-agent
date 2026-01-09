import React from 'react';

export interface ContactContext {
  name: string;
  email: string;
  interactionLevel: 'low' | 'medium' | 'high';
  commonTopics: string[];
  recentThreadCount: number;
}

interface PrepCardProps {
  context: ContactContext;
}

export function PrepCard({ context }: PrepCardProps) {
  const badgeColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-green-100 text-green-800',
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white max-w-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{context.name}</h3>
          <p className="text-sm text-gray-500">{context.email}</p>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            badgeColors[context.interactionLevel]
          }`}
        >
          {context.interactionLevel}
        </span>
      </div>

      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Common Topics
        </h4>
        <div className="flex flex-wrap gap-2">
          {context.commonTopics.map((topic) => (
            <span
              key={topic}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">{context.recentThreadCount}</span> recent threads
        </p>
      </div>
    </div>
  );
}
