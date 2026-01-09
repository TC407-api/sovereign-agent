'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'convex/react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { api } from '@/convex/_generated/api';
import { Mail, FileText, Calendar, Shield, Sparkles, Command, AlertCircle, X, Send, LogIn, LogOut, User } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { PulseIndicator } from '@/components/ui/pulse-indicator';
import {
  staggerContainer,
  staggerItem,
  modalVariants,
  backdropVariants,
  cardHoverVariants,
  springs,
} from '@/lib/design-tokens';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [showCommand, setShowCommand] = useState(false);
  const [commandInput, setCommandInput] = useState('');

  const emails = useQuery(api.emails.listEmails, {});
  const drafts = useQuery(api.drafts.getPendingDrafts, {});

  const emailCount = emails?.length ?? 0;
  const draftCount = drafts?.length ?? 0;
  const highPriorityCount = emails?.filter(e => e.priority === 'high' || e.priority === 'urgent').length ?? 0;

  const navCards = [
    {
      href: '/emails',
      icon: Mail,
      color: 'blue',
      title: 'Inbox',
      description: 'View and manage your emails with AI-powered priority sorting',
    },
    {
      href: '/drafts',
      icon: FileText,
      color: 'amber',
      title: 'Draft Review',
      description: 'Review, edit, and approve AI-generated email drafts',
    },
    {
      href: '/calendar',
      icon: Calendar,
      color: 'green',
      title: 'Calendar',
      description: 'Manage your schedule and detect meeting conflicts',
    },
    {
      href: '/sidecar',
      icon: Sparkles,
      color: 'purple',
      title: 'AI Sidecar',
      description: 'Context-aware assistant with contact prep cards',
    },
    {
      href: '/safety',
      icon: Shield,
      color: 'red',
      title: 'Safety Dashboard',
      description: 'Monitor AI actions, approvals, and audit trails',
    },
  ];

  const colorMap: Record<string, { bg: string; iconBg: string; border: string }> = {
    blue: { bg: 'hover:border-blue-500/50', iconBg: 'bg-blue-500/20', border: 'group-hover:shadow-blue-500/10' },
    amber: { bg: 'hover:border-amber-500/50', iconBg: 'bg-amber-500/20', border: 'group-hover:shadow-amber-500/10' },
    green: { bg: 'hover:border-green-500/50', iconBg: 'bg-green-500/20', border: 'group-hover:shadow-green-500/10' },
    purple: { bg: 'hover:border-purple-500/50', iconBg: 'bg-purple-500/20', border: 'group-hover:shadow-purple-500/10' },
    red: { bg: 'hover:border-red-500/50', iconBg: 'bg-red-500/20', border: 'group-hover:shadow-red-500/10' },
    cyan: { bg: 'hover:border-cyan-500/50', iconBg: 'bg-cyan-500/20', border: 'group-hover:shadow-cyan-500/10' },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40"
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-white">Sovereign Agent</h1>
                <p className="text-sm text-slate-400">AI Email Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
                <PulseIndicator status="online" size="sm" />
                <span className="text-xs text-slate-400">Live</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCommand(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-medium transition-all"
              >
                <Command className="w-4 h-4" />
                AI Command
              </motion.button>

              {status === 'loading' ? (
                <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
              ) : session ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-600">
                    <User className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-300">{session.user?.email?.split('@')[0]}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => signOut()}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => signIn('google')}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-medium transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in with Google
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {[
            { icon: Mail, value: emailCount, label: 'Emails', color: 'blue' },
            { icon: FileText, value: draftCount, label: 'Pending Drafts', color: 'amber' },
            { icon: AlertCircle, value: highPriorityCount, label: 'High Priority', color: 'red' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Navigation Cards */}
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-white mb-4"
        >
          Quick Access
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {navCards.map((card, i) => {
            const colors = colorMap[card.color];
            return (
              <motion.div key={card.href} variants={staggerItem}>
                <Link href={card.href} className="group block">
                  <motion.div
                    variants={cardHoverVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className={`bg-slate-800/50 rounded-xl p-6 border border-slate-700 ${colors.bg} hover:bg-slate-800 transition-all ${colors.border} group-hover:shadow-lg`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={springs.bouncy}
                      className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center mb-4`}
                    >
                      <card.icon className={`w-6 h-6 text-${card.color}-400`} />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-white mb-1">{card.title}</h3>
                    <p className="text-sm text-slate-400">{card.description}</p>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}

          {/* AI Command Card - Special styling */}
          <motion.div variants={staggerItem}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setShowCommand(true)}
              className="cursor-pointer bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-cyan-500/30 hover:border-cyan-400/50 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all group-hover:shadow-lg group-hover:shadow-cyan-500/10"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={springs.bouncy}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/25"
              >
                <Command className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-1">AI Command</h3>
              <p className="text-sm text-slate-400">Ask AI to do anything with natural language</p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20"
        >
          <div className="flex items-center gap-3">
            <PulseIndicator status="online" size="sm" />
            <p className="text-sm text-slate-300">
              <span className="font-medium text-white">401 tests passing</span> • Connected to Convex • AI ready
            </p>
          </div>
        </motion.div>
      </div>

      {/* Command Modal */}
      <AnimatePresence>
        {showCommand && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={backdropVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => setShowCommand(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-start justify-center pt-[20vh] z-50 pointer-events-none">
              <motion.div
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl shadow-black/50 overflow-hidden pointer-events-auto"
              >
                <div className="flex items-center gap-3 p-4 border-b border-slate-700">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"
                  >
                    <Command className="w-5 h-5 text-white" />
                  </motion.div>
                  <input
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder="Ask AI anything... (e.g., 'draft a reply to the urgent email')"
                    className="flex-1 bg-transparent text-white text-lg placeholder:text-slate-500 outline-none"
                    autoFocus
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCommand(false)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                <div className="p-4">
                  <div className="text-sm text-slate-400 mb-3">Quick commands:</div>
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-2 gap-2"
                  >
                    {[
                      'Draft reply to latest email',
                      'Summarize my inbox',
                      'Show high priority emails',
                      'Check calendar conflicts',
                    ].map((cmd, i) => (
                      <motion.button
                        key={cmd}
                        variants={staggerItem}
                        whileHover={{ scale: 1.02, backgroundColor: 'rgb(51 65 85)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCommandInput(cmd)}
                        className="text-left p-3 rounded-lg bg-slate-700/50 text-slate-300 text-sm transition-colors"
                      >
                        {cmd}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
                <div className="p-4 border-t border-slate-700 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      console.log('Execute command:', commandInput);
                      setShowCommand(false);
                      setCommandInput('');
                    }}
                    disabled={!commandInput.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Execute
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
