"use client";

// Disable static generation for this page (requires Convex client)
export const dynamic = "force-dynamic";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { EmailList } from "@/components/EmailList";
import { SyncButton } from "@/components/SyncButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox } from "lucide-react";

export function EmailListPage() {
  const emails = useQuery(api.emails.listEmails, {});

  // Loading state
  if (emails === undefined) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // Empty state
  if (emails.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Inbox</h1>
          <SyncButton />
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Inbox className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">No emails yet</h3>
          <p className="text-slate-500 mt-1">
            Sync your Gmail to get started.
          </p>
        </div>
      </div>
    );
  }

  // Transform Convex data to component format
  const formattedEmails = emails.map((email: Doc<"emails">) => ({
    id: email._id,
    from: email.from,
    subject: email.subject,
    date: new Date(email.date),
    priority: email.priority,
    body: email.body,
  }));

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <SyncButton />
      </div>
      <EmailList emails={formattedEmails} />
    </div>
  );
}

export default EmailListPage;
