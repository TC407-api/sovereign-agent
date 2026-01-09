'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SidecarPanel } from './SidecarPanel';
import { useSidecarContext } from '@/lib/hooks/useSidecarContext';
import { checkConflicts } from '@/lib/calendar/conflict-detector';
import { parseMeetingProposal } from '@/lib/calendar/proposal-parser';
import type { CalendarConflict, ConflictCheckResult } from '@/lib/types/calendar';
import { ArrowLeft, Sparkles, Search, FileText } from 'lucide-react';
import { springs } from '@/lib/design-tokens';

export function SidecarPage() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [emailContent, setEmailContent] = useState<{ subject: string; body: string } | null>(null);
  const { contactContext, isLoading } = useSidecarContext(selectedEmail);

  // Parse meeting proposal from email content if available
  const meetingProposal = emailContent
    ? parseMeetingProposal(emailContent)
    : null;

  // Mock existing calendar events for demo
  const mockCalendarEvents: CalendarConflict[] = [
    {
      eventId: 'evt-1',
      title: 'Team Standup',
      start: new Date('2026-01-10T09:00:00'),
      end: new Date('2026-01-10T09:30:00'),
      severity: 'hard',
    },
  ];

  // Check conflicts if we have a meeting proposal
  const conflictResult: ConflictCheckResult | null = meetingProposal?.proposedStart
    ? checkConflicts(
        meetingProposal.proposedStart,
        meetingProposal.proposedEnd || new Date(meetingProposal.proposedStart.getTime() + 3600000),
        mockCalendarEvents
      )
    : null;

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

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.1 }}
          className="flex items-center gap-3 mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 text-purple-400" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Sidecar</h1>
            <p className="text-sm text-slate-400">Context-aware email assistant</p>
          </div>
        </motion.div>

        {/* Demo input to select email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.2 }}
          className="mb-6 p-4 bg-slate-800 rounded-xl border border-slate-700"
        >
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
            <Search className="w-4 h-4 text-slate-500" />
            Enter sender email to load context:
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="sender@example.com"
              className="flex-1 px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSelectedEmail((e.target as HTMLInputElement).value);
                }
              }}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-lg font-medium transition-all"
              onClick={() => {
                const input = document.querySelector('input[type="email"]') as HTMLInputElement;
                setSelectedEmail(input?.value || null);
              }}
            >
              Load Context
            </motion.button>
          </div>
        </motion.div>

        {/* Demo email content input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.3 }}
          className="mb-6 p-4 bg-slate-800 rounded-xl border border-slate-700"
        >
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
            <FileText className="w-4 h-4 text-slate-500" />
            Paste email content to check for meeting proposals:
          </label>
          <textarea
            placeholder="Subject: Meeting request&#10;&#10;Hi, can we schedule a call for tomorrow at 10am?"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-28 resize-none"
            onChange={(e) => {
              const text = e.target.value;
              const lines = text.split('\n');
              const subject = lines[0].replace(/^subject:\s*/i, '');
              const body = lines.slice(1).join('\n').trim();
              setEmailContent({ subject, body });
            }}
          />
        </motion.div>

        {/* Sidecar Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.4 }}
          className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
        >
          <SidecarPanel
            contactContext={contactContext}
            conflictResult={conflictResult}
            isLoading={isLoading}
          />
        </motion.div>
      </div>
    </div>
  );
}
