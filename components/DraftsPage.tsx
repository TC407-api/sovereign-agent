'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePendingDrafts } from '@/lib/hooks/usePendingDrafts';
import { PendingDraftsList } from './PendingDraftsList';
import { DraftReview } from './DraftReview';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { springs, staggerContainer, staggerItem } from '@/lib/design-tokens';

interface Email {
  _id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  snippet: string;
  date: number;
  gmailId: string;
  threadId: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  receivedAt: number;
  priority?: string;
}

interface Draft {
  _id: string;
  subject: string;
  body: string;
  originalContent: string;
  generatedAt: number;
  status: 'draft' | 'approved' | 'rejected' | 'sent' | 'discarded';
  editCount: number;
  emailId: string;
  email: Email | null;
}

export function DraftsPage() {
  const { drafts, isLoading, count, hasPendingDrafts } = usePendingDrafts();
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveDraft = useMutation(api.drafts.approveDraft);
  const rejectDraft = useMutation(api.drafts.rejectDraft);
  const updateDraft = useMutation(api.drafts.updateDraft);

  const handleSelectDraft = (draft: Draft) => {
    setSelectedDraft(draft);
    setError(null);
  };

  const handleApprove = async (draftId: string) => {
    try {
      setActionLoading(true);
      setError(null);
      await approveDraft({ id: draftId as Id<'drafts'> });
      setSelectedDraft(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve draft');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (draftId: string) => {
    try {
      setActionLoading(true);
      setError(null);
      await rejectDraft({ id: draftId as Id<'drafts'>, reason: 'User rejected' });
      setSelectedDraft(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject draft');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async (draftId: string, content: string) => {
    try {
      setActionLoading(true);
      setError(null);
      await updateDraft({ id: draftId as Id<'drafts'>, body: content });
      // Update local state
      if (selectedDraft) {
        setSelectedDraft({ ...selectedDraft, body: content });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedDraft(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading drafts...
        </div>
      </div>
    );
  }

  // Transform drafts for DraftReview component
  const transformedDraft = selectedDraft && selectedDraft.email ? {
    id: selectedDraft._id,
    originalEmail: {
      id: selectedDraft.email._id,
      from: selectedDraft.email.from,
      subject: selectedDraft.email.subject,
      date: new Date(selectedDraft.email.date),
      body: selectedDraft.email.body,
      priority: (selectedDraft.email.priority as 'low' | 'medium' | 'high') || 'medium',
    },
    draftContent: selectedDraft.body,
    priority: (selectedDraft.email.priority as 'low' | 'medium' | 'high') || 'medium',
    confidence: 0.85,
    status: selectedDraft.status === 'draft' ? 'pending' as const : selectedDraft.status as 'processing' | 'approved' | 'rejected',
  } : null;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={springs.default}
        >
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"
            >
              <FileText className="w-5 h-5 text-amber-400" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Draft Reviews {hasPendingDrafts && (
                  <span className="ml-2 px-2 py-0.5 text-sm bg-amber-500/20 text-amber-400 rounded-full">
                    {count}
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-400">
                Review and approve AI-generated email drafts
              </p>
            </div>
          </div>
        </motion.header>

        {selectedDraft && transformedDraft ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springs.default}
          >
            <motion.button
              whileHover={{ x: -4 }}
              onClick={handleBack}
              className="mb-4 text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to list
            </motion.button>
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <DraftReview
                draft={transformedDraft}
                onApprove={handleApprove}
                onReject={handleReject}
                onSave={handleSave}
                isLoading={actionLoading}
                error={error || undefined}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.default, delay: 0.2 }}
            className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
          >
            <PendingDraftsList
              drafts={drafts as Draft[]}
              onSelectDraft={handleSelectDraft}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
