'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Inbox, ChevronRight } from 'lucide-react';
import { staggerContainer, staggerItem, springs } from '@/lib/design-tokens';

interface Email {
  _id: string;
  from: string;
  subject: string;
  snippet: string;
  date: number;
}

interface Draft {
  _id: string;
  subject: string;
  body: string;
  generatedAt: number;
  status: 'draft' | 'approved' | 'rejected' | 'sent' | 'discarded';
  editCount: number;
  email: Email | null;
}

interface PendingDraftsListProps {
  drafts: Draft[];
  onSelectDraft: (draft: Draft) => void;
}

export function PendingDraftsList({ drafts, onSelectDraft }: PendingDraftsListProps) {
  if (drafts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={springs.bouncy}
          className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4"
        >
          <Inbox className="w-8 h-8 text-slate-500" />
        </motion.div>
        <p className="text-slate-400">No pending drafts to review</p>
        <p className="text-sm text-slate-500 mt-1">Drafts will appear here when AI generates email responses</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <h2 className="text-lg font-semibold text-white">
          {drafts.length} pending {drafts.length === 1 ? 'draft' : 'drafts'}
        </h2>
      </div>
      <motion.ul
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="divide-y divide-slate-700/50"
      >
        {drafts.map((draft) => (
          <motion.li
            key={draft._id}
            variants={staggerItem}
            whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}
            onClick={() => onSelectDraft(draft)}
            className="p-4 cursor-pointer transition-colors"
          >
            <motion.div
              whileHover={{ x: 4 }}
              transition={springs.gentle}
              className="flex justify-between items-start"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {draft.subject || '(no subject)'}
                  </p>
                  {draft.email && (
                    <p className="text-sm text-slate-400 mt-0.5">
                      Reply to {draft.email.from.includes('<') ? draft.email.from.split('<')[0].trim() : draft.email.from}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 mt-1 truncate">
                    {draft.body.slice(0, 100)}...
                  </p>
                </div>
              </div>
              <div className="ml-4 flex items-center gap-2 flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                  Pending Review
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </motion.div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
