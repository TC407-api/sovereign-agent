"use client";

export const dynamic = "force-dynamic";

import { use, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { EmailDetailView } from "@/components/EmailDetailView";
import { ArrowLeft, Star, Archive, Reply, Forward, Trash2, MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface EmailDetailPageProps {
  params: Promise<{ id: string }>;
}

export function EmailDetailPage({ params }: EmailDetailPageProps) {
  const { id } = use(params);
  const email = useQuery(api.emails.getEmail, {
    id: id as Id<"emails">,
  });
  const updateEmail = useMutation(api.emails.updateEmail);

  // Mark as read when opened
  useEffect(() => {
    if (email && !email.isRead) {
      updateEmail({ id: email._id, isRead: true });
    }
  }, [email, updateEmail]);

  if (email === undefined) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-32 bg-slate-800 rounded-lg" />
            <div className="h-12 w-3/4 bg-slate-800 rounded-lg" />
            <div className="h-6 w-48 bg-slate-800 rounded-lg" />
            <div className="h-96 bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (email === null) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Archive className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Email not found</h2>
            <p className="text-slate-400 mb-6">This email may have been deleted or moved.</p>
            <Link
              href="/emails"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Inbox
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const priorityColors = {
    urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    normal: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    low: 'bg-slate-600/20 text-slate-500 border-slate-600/30',
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/emails"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inbox
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateEmail({ id: email._id, isStarred: !email.isStarred })}
              className={`p-2 rounded-lg transition-all ${
                email.isStarred
                  ? "text-yellow-400 bg-yellow-500/20"
                  : "text-slate-400 hover:text-yellow-400 hover:bg-slate-800"
              }`}
              title={email.isStarred ? "Unstar" : "Star"}
            >
              <Star className="w-5 h-5" fill={email.isStarred ? "currentColor" : "none"} />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              title="Reply"
            >
              <Reply className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              title="Forward"
            >
              <Forward className="w-5 h-5" />
            </button>

            <button
              onClick={() => updateEmail({ id: email._id, isArchived: true })}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              title="Archive"
            >
              <Archive className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              title="More options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Priority Badge */}
        {email.priority && email.priority !== 'normal' && (
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[email.priority] || priorityColors.normal}`}>
              {email.priority.charAt(0).toUpperCase() + email.priority.slice(1)} Priority
            </span>
          </div>
        )}

        {/* Email Content */}
        <EmailDetailView
          email={{
            id: email._id,
            from: email.from,
            subject: email.subject,
            body: email.body,
            date: new Date(email.date),
            priority: email.priority,
          }}
        />

        {/* Quick Actions Footer */}
        <div className="mt-6 flex items-center gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-medium transition-all">
            <Reply className="w-4 h-4" />
            Reply
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all">
            <Forward className="w-4 h-4" />
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailDetailPage;
