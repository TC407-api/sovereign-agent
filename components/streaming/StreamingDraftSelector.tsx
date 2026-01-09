'use client';

import React from 'react';

interface Draft {
  id: string;
  tone: 'professional' | 'friendly' | 'concise';
  content: string;
  isGenerating: boolean;
}

interface StreamingDraftSelectorProps {
  drafts: Draft[];
  isLoading: boolean;
  selectedId?: string;
  onSelect: (draft: Draft) => void;
}

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border rounded-lg">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-3/4 mt-1" />
        </div>
      ))}
    </div>
  );
}

const toneColors = {
  professional: 'bg-blue-100 text-blue-800 border-blue-200',
  friendly: 'bg-green-100 text-green-800 border-green-200',
  concise: 'bg-purple-100 text-purple-800 border-purple-200',
};

const toneIcons = {
  professional: '\uD83D\uDCBC', // briefcase
  friendly: '\uD83D\uDE0A', // smile
  concise: '\u26A1', // lightning
};

export function StreamingDraftSelector({
  drafts,
  isLoading,
  selectedId,
  onSelect,
}: StreamingDraftSelectorProps) {
  if (isLoading) return <Skeleton />;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-600">Select a draft tone:</h3>
      {drafts.map((draft) => (
        <button
          key={draft.id}
          onClick={() => onSelect(draft)}
          disabled={draft.isGenerating}
          className={`w-full text-left p-4 border rounded-lg transition-all ${
            selectedId === draft.id
              ? 'ring-2 ring-blue-500 border-blue-500'
              : 'hover:border-gray-400'
          } ${draft.isGenerating ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${toneColors[draft.tone]}`}>
              {toneIcons[draft.tone]} {draft.tone}
            </span>
            {draft.isGenerating && (
              <span className="flex items-center text-xs text-gray-500">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1" />
                Generating...
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">{draft.content}</p>
        </button>
      ))}
    </div>
  );
}
