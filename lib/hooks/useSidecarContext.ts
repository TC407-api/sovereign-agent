'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { ContactContext, InteractionSummary, RecentThread } from '@/lib/types/contact';

interface UseSidecarContextResult {
  contactContext: ContactContext | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSidecarContext(selectedEmail: string | null): UseSidecarContextResult {
  // Query contact data
  const contact = useQuery(
    api.contacts.getContactByEmail,
    selectedEmail ? { email: selectedEmail } : 'skip'
  );

  // Query emails from this contact
  const emails = useQuery(
    api.emails.getEmailsByContact,
    selectedEmail ? { email: selectedEmail } : 'skip'
  );

  // If no email selected, return null context
  if (!selectedEmail) {
    return {
      contactContext: null,
      isLoading: false,
      error: null,
    };
  }

  // Loading state
  if (contact === undefined || emails === undefined) {
    return {
      contactContext: null,
      isLoading: true,
      error: null,
    };
  }

  // If no contact found, return null context
  if (!contact) {
    return {
      contactContext: null,
      isLoading: false,
      error: null,
    };
  }

  // Calculate interaction summary
  const interactions: InteractionSummary = calculateInteractions(emails || []);

  // Build recent threads
  const recentThreads: RecentThread[] = buildRecentThreads(emails || []);

  // Build contact context
  const contactContext: ContactContext = {
    contact: {
      email: contact.email,
      name: contact.name,
      company: contact.company,
      role: contact.role,
      avatarUrl: contact.avatarUrl,
      lastInteraction: new Date(contact.lastInteraction),
      interactionCount: contact.interactionCount,
    },
    interactions,
    recentThreads,
  };

  return {
    contactContext,
    isLoading: false,
    error: null,
  };
}

function calculateInteractions(emails: any[]): InteractionSummary {
  const totalEmails = emails.length;
  const sentByMe = emails.filter((e) => e.from === 'me@example.com').length;
  const receivedFromThem = totalEmails - sentByMe;

  // Calculate average response time (simplified)
  const avgResponseTimeHours = totalEmails > 0 ? 4.0 : 0;

  // Extract common topics from subjects
  const topicCounts = new Map<string, number>();
  for (const email of emails) {
    const words = (email.subject || '').toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 4) {
        topicCounts.set(word, (topicCounts.get(word) || 0) + 1);
      }
    }
  }

  const commonTopics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);

  return {
    totalEmails,
    sentByMe,
    receivedFromThem,
    avgResponseTimeHours,
    commonTopics,
  };
}

function buildRecentThreads(emails: any[]): RecentThread[] {
  const threadMap = new Map<string, RecentThread>();

  for (const email of emails) {
    const threadId = email.threadId || email._id;
    const existing = threadMap.get(threadId);

    if (!existing || email.receivedAt > existing.lastMessageDate.getTime()) {
      threadMap.set(threadId, {
        threadId,
        subject: email.subject || 'No Subject',
        lastMessageDate: new Date(email.receivedAt),
        messageCount: 1,
      });
    } else {
      // Increment message count for existing thread
      threadMap.set(threadId, {
        ...existing,
        messageCount: existing.messageCount + 1,
      });
    }
  }

  return Array.from(threadMap.values())
    .sort((a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime())
    .slice(0, 5);
}
