'use client';

import { useQuery } from 'convex/react';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import type { Doc } from '@/convex/_generated/dataModel';
import { SyncButton } from '@/components/SyncButton';
import { EmailPreview } from '@/components/EmailDetailView';
import Link from 'next/link';
import { ArrowLeft, Inbox, LogIn, Star, Clock, Mail } from 'lucide-react';
import { staggerContainer, staggerItem, springs } from '@/lib/design-tokens';

export default function EmailsPage() {
  const { data: session } = useSession();
  const emails = useQuery(api.emails.listEmails, {});

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isThisYear = date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (isThisYear) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const priorityConfig = {
    urgent: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    high: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    normal: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
    low: { bg: 'bg-slate-600/20', text: 'text-slate-500', border: 'border-slate-600/30' },
  };

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
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"
            >
              <Mail className="w-5 h-5 text-blue-400" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-white">Inbox</h1>
              <p className="text-sm text-slate-400">
                {emails ? `${emails.length} emails` : 'Loading...'}
              </p>
            </div>
          </div>
          {session ? (
            <SyncButton />
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => signIn('google')}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-medium transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign in to sync
            </motion.button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.2 }}
          className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
        >
          {emails === undefined ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4"
                >
                  <div className="w-10 h-10 bg-slate-700 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-1/3 animate-pulse" />
                    <div className="h-4 bg-slate-700 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-slate-700 rounded w-1/2 animate-pulse" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : emails.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...springs.bouncy, delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4"
              >
                <Inbox className="w-8 h-8 text-slate-500" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-2">No emails yet</h3>
              <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                {session ? 'Click "Sync Gmail" to fetch your emails from Google.' : 'Sign in with Google to sync your inbox.'}
              </p>
              {!session && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => signIn('google')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-medium transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in with Google
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="divide-y divide-slate-700/50"
            >
              <AnimatePresence>
                {emails.map((email: Doc<"emails">, index: number) => {
                  const priority = priorityConfig[email.priority as keyof typeof priorityConfig] || priorityConfig.normal;

                  return (
                    <motion.div
                      key={email._id}
                      variants={staggerItem}
                      layout
                      exit={{ opacity: 0, x: -100 }}
                    >
                      <Link
                        href={`/emails/${email._id}`}
                        className={`block p-4 hover:bg-slate-700/30 transition-colors ${!email.isRead ? 'bg-slate-700/20' : ''}`}
                      >
                        <motion.div
                          whileHover={{ x: 4 }}
                          transition={springs.gentle}
                          className="flex items-start gap-4"
                        >
                          {/* Avatar */}
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0"
                          >
                            <span className="text-white font-medium text-sm">
                              {email.from.charAt(0).toUpperCase()}
                            </span>
                          </motion.div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium truncate ${!email.isRead ? 'text-white' : 'text-slate-300'}`}>
                                {email.from.includes('<') ? email.from.split('<')[0].trim() : email.from.split('@')[0]}
                              </span>
                              {email.isStarred && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={springs.bouncy}
                                >
                                  <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="currentColor" />
                                </motion.div>
                              )}
                              {email.priority && email.priority !== 'normal' && (
                                <motion.span
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${priority.bg} ${priority.text}`}
                                >
                                  {email.priority}
                                </motion.span>
                              )}
                            </div>
                            <p className={`truncate mb-1 ${!email.isRead ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                              {email.subject || '(no subject)'}
                            </p>
                            <div className="text-sm truncate">
                              <EmailPreview body={email.body || ''} maxLength={100} />
                            </div>
                          </div>

                          {/* Date */}
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(email.date)}
                            </span>
                            {!email.isRead && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={springs.bouncy}
                                className="w-2 h-2 rounded-full bg-blue-500"
                              />
                            )}
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
