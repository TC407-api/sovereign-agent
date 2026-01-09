'use client';

import React, { useState } from 'react';

interface OriginalEmail {
  id: string;
  from: string;
  subject: string;
  date: Date;
  body: string;
  priority: 'low' | 'medium' | 'high';
}

interface Draft {
  id: string;
  originalEmail: OriginalEmail;
  draftContent: string;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
}

interface DraftReviewProps {
  draft: Draft;
  onApprove: (draftId: string) => void;
  onReject: (draftId: string) => void;
  onSave: (draftId: string, content: string) => void;
  isLoading?: boolean;
  error?: string;
}

export function DraftReview({
  draft,
  onApprove,
  onReject,
  onSave,
  isLoading = false,
  error,
}: DraftReviewProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(draft.draftContent);

  const handleApprove = () => {
    onApprove(draft.id);
  };

  const handleReject = () => {
    onReject(draft.id);
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setEditedContent(draft.draftContent);
  };

  const handleSave = () => {
    onSave(draft.id, editedContent);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedContent(draft.draftContent);
  };

  const isDisabled = isLoading || !!error;
  const confidencePercentage = Math.round(draft.confidence * 100);
  const priorityLabel =
    draft.priority.charAt(0).toUpperCase() + draft.priority.slice(1);

  return (
    <div
      data-testid="draft-review-container"
      className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden"
    >
      {/* Loading State */}
      {isLoading && (
        <div
          data-testid="draft-review-loading"
          aria-busy="true"
          className="p-4 bg-blue-50 text-blue-700 flex items-center gap-3"
        >
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-700 border-t-transparent"></div>
          <span>Processing draft...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          data-testid="draft-review-error"
          role="alert"
          className="p-4 bg-red-50 text-red-700 flex items-center gap-3"
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Original Email Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Original Email
          </h2>
          <div className="space-y-3 bg-gray-50 p-4 rounded-md">
            <div>
              <p className="text-sm text-gray-600">From:</p>
              <p className="text-gray-900">{draft.originalEmail.from}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Subject:</p>
              <p className="text-gray-900">{draft.originalEmail.subject}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Message:</p>
              <p
                data-testid="original-email-body"
                className="text-gray-900 mt-1 whitespace-pre-wrap"
              >
                {draft.originalEmail.body}
              </p>
            </div>
          </div>
        </section>

        {/* AI-Generated Reply Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              AI-Generated Reply
            </h2>
            <div className="flex gap-2">
              <span
                data-testid="priority-badge"
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  draft.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : draft.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }`}
              >
                {priorityLabel}
              </span>
              <span
                data-testid="confidence-badge"
                className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {confidencePercentage}%
              </span>
            </div>
          </div>

          {!isEditMode ? (
            <div
              data-testid="draft-content"
              className="bg-gray-50 p-4 rounded-md text-gray-900 whitespace-pre-wrap min-h-24"
            >
              {draft.draftContent}
            </div>
          ) : (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none min-h-32 font-mono text-sm"
              placeholder="Edit draft content..."
            />
          )}
        </section>

        {/* Action Buttons */}
        <div
          data-testid="action-buttons"
          className="flex flex-wrap gap-3 pt-4 border-t border-gray-200"
        >
          {!isEditMode ? (
            <>
              <button
                onClick={handleApprove}
                disabled={isDisabled}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                disabled={isDisabled}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                Reject
              </button>
              <button
                onClick={handleEdit}
                disabled={isDisabled}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                Edit
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
