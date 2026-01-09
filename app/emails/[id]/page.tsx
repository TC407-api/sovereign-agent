"use client";

// Disable static generation for this page (requires Convex client)
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { EmailDetailView } from "@/components/EmailDetailView";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, Archive } from "lucide-react";
import Link from "next/link";

interface EmailDetailPageProps {
  params: { id: string };
}

export function EmailDetailPage({ params }: EmailDetailPageProps) {
  const email = useQuery(api.emails.getEmail, {
    id: params.id as Id<"emails">,
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
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (email === null) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Email not found</p>
        <Link href="/emails" className="text-blue-500 hover:underline mt-2 block">
          Back to inbox
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/emails"
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex-1">
          <h1 className="text-xl font-bold">{email.subject}</h1>
          <p className="text-sm text-slate-600">{email.from}</p>
        </div>

        {email.priority && <PriorityBadge priority={email.priority} />}

        <button
          onClick={() => updateEmail({ id: email._id, isStarred: !email.isStarred })}
          className={`p-2 rounded-lg transition ${
            email.isStarred ? "text-yellow-500" : "text-slate-400 hover:text-yellow-500"
          }`}
        >
          <Star className="h-5 w-5" fill={email.isStarred ? "currentColor" : "none"} />
        </button>

        <button
          onClick={() => updateEmail({ id: email._id, isArchived: true })}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <Archive className="h-5 w-5" />
        </button>
      </div>

      {/* Email content */}
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
    </div>
  );
}

export default EmailDetailPage;
