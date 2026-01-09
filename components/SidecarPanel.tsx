'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { ContactContext } from '@/lib/types/contact';
import { getInteractionLevel, getDisplayName } from '@/lib/types/contact';
import type { ConflictCheckResult } from '@/lib/types/calendar';
import { PrepCard, ContactContext as PrepCardContext } from './PrepCard';
import { ConflictDetector } from './ConflictDetector';
import { Mail, User, Calendar, Loader2 } from 'lucide-react';
import { staggerContainer, staggerItem, springs } from '@/lib/design-tokens';

interface SidecarPanelProps {
  contactContext: ContactContext | null;
  conflictResult: ConflictCheckResult | null;
  isLoading: boolean;
}

function transformToPreCardContext(ctx: ContactContext): PrepCardContext {
  const level = getInteractionLevel(ctx.contact.interactionCount);
  const interactionLevel = level === 'new' ? 'low' : level === 'occasional' ? 'medium' : 'high';

  return {
    name: getDisplayName(ctx.contact),
    email: ctx.contact.email,
    interactionLevel,
    commonTopics: ctx.interactions.commonTopics,
    recentThreadCount: ctx.recentThreads.length,
  };
}

export function SidecarPanel({
  contactContext,
  conflictResult,
  isLoading,
}: SidecarPanelProps) {
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin mr-3" />
          <span className="text-slate-400">Loading context...</span>
        </div>
      </div>
    );
  }

  const hasContent = contactContext || conflictResult;

  if (!hasContent) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center h-32 text-slate-500"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={springs.bouncy}
            className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3"
          >
            <Mail className="w-6 h-6 text-slate-500" />
          </motion.div>
          <p className="text-sm text-slate-400">Select an email to view context</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="p-6 space-y-6"
    >
      <motion.div variants={staggerItem} className="border-b border-slate-700 pb-4">
        <h2 className="text-lg font-semibold text-white">
          Email Context
        </h2>
      </motion.div>

      {contactContext && (
        <motion.section variants={staggerItem}>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-medium text-slate-300">Contact Info</h3>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <PrepCard context={transformToPreCardContext(contactContext)} />
          </div>
        </motion.section>
      )}

      {conflictResult && (
        <motion.section variants={staggerItem}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-medium text-slate-300">Calendar Check</h3>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <ConflictDetector
              conflicts={conflictResult.conflicts}
              alternatives={conflictResult.alternatives}
              isLoading={false}
            />
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
