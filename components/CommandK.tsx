'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseCommand, getCommandExamples } from '@/lib/ai/command-parser';
import { classifyIntent, executeIntent } from '@/lib/ai/intent-classifier';
import type { ActionPlan } from '@/lib/ai/intent-classifier';
import {
  Search,
  Mail,
  Calendar,
  Archive,
  Star,
  Send,
  Clock,
  Filter,
  Sparkles,
  MessageSquare,
  X,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { springs } from '@/lib/design-tokens';

interface CommandKProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (actionPlan: ActionPlan) => void;
}

const COMMAND_ICONS: Record<string, React.ReactNode> = {
  DRAFT_REPLY: <MessageSquare className="w-5 h-5" />,
  SUMMARIZE_INBOX: <Mail className="w-5 h-5" />,
  FILTER_EMAILS: <Filter className="w-5 h-5" />,
  SEARCH_EMAILS: <Search className="w-5 h-5" />,
  SCHEDULE_FOLLOWUP: <Clock className="w-5 h-5" />,
  CALENDAR_QUERY: <Calendar className="w-5 h-5" />,
  BATCH_ARCHIVE: <Archive className="w-5 h-5" />,
  SCHEDULE_MEETING: <Calendar className="w-5 h-5" />,
  FIND_FREE_TIME: <Clock className="w-5 h-5" />,
  SHOW_HELP: <Sparkles className="w-5 h-5" />,
};

export function CommandK({ isOpen, onClose, onExecute }: CommandKProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get command examples for suggestions
  const suggestions = getCommandExamples();

  const filteredSuggestions = query.length > 0
    ? suggestions.filter(s =>
        s.command.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase())
      )
    : suggestions;

  // Process command with AI
  const processCommand = useCallback(async (input: string) => {
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      // Step 1: Parse the command
      const parsed = await parseCommand(input);

      // Step 2: Classify with AI if needed
      const classification = await classifyIntent(parsed);

      // Step 3: Generate action plan
      const plan = await executeIntent(classification);

      setActionPlan(plan);

      // Auto-execute non-confirmation actions
      if (!plan.requiresConfirmation) {
        onExecute(plan);
        onClose();
      }
    } catch (error) {
      console.error('Command processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onExecute, onClose]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
      setActionPlan(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredSuggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (actionPlan?.requiresConfirmation) {
          onExecute(actionPlan);
          onClose();
        } else if (query.trim()) {
          processCommand(query);
        } else if (filteredSuggestions[selectedIndex]) {
          processCommand(filteredSuggestions[selectedIndex].command);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, query, filteredSuggestions, selectedIndex, actionPlan, onClose, onExecute, processCommand]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={springs.default}
          role="dialog"
          aria-modal="true"
          className="w-full max-w-xl bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700"
          onClick={e => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask me anything... (e.g., 'summarize my inbox')"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setActionPlan(null);
                }}
                className="flex-1 bg-transparent text-white text-lg placeholder:text-slate-500 outline-none"
              />
              {isProcessing && (
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Plan Preview (when requires confirmation) */}
          {actionPlan?.requiresConfirmation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-amber-500/10 border-b border-amber-500/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    {COMMAND_ICONS[actionPlan.action] || <Sparkles className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-amber-400 font-medium">{actionPlan.description}</p>
                    <p className="text-sm text-amber-400/70">Press Enter to confirm</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onExecute(actionPlan);
                    onClose();
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  Confirm
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Suggestions */}
          <ul className="max-h-80 overflow-y-auto py-2">
            {filteredSuggestions.length === 0 ? (
              <li className="px-4 py-8 text-center text-slate-500">
                <p>No matching commands</p>
                <p className="text-sm mt-1">Try typing a natural language command</p>
              </li>
            ) : (
              filteredSuggestions.map((s, i) => (
                <motion.li
                  key={s.command}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors ${
                    i === selectedIndex
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                  onClick={() => processCommand(s.command)}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    i === selectedIndex ? 'bg-purple-500/30 text-purple-300' : 'bg-slate-700 text-slate-400'
                  }`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{s.command}</p>
                    <p className="text-sm text-slate-500">{s.description}</p>
                  </div>
                  {i === selectedIndex && (
                    <motion.div
                      layoutId="selected-indicator"
                      className="w-1.5 h-8 bg-purple-500 rounded-full"
                    />
                  )}
                </motion.li>
              ))
            )}
          </ul>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">↵</kbd>
                execute
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">esc</kbd>
                close
              </span>
            </div>
            <span className="text-purple-400">Powered by Gemini</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
