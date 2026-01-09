export interface Contact {
  email: string;
  name?: string;
  company?: string;
  role?: string;
  avatarUrl?: string;
  lastInteraction: Date;
  interactionCount: number;
}

export interface InteractionSummary {
  totalEmails: number;
  sentByMe: number;
  receivedFromThem: number;
  avgResponseTimeHours: number;
  commonTopics: string[];
}

export interface RecentThread {
  threadId: string;
  subject: string;
  lastMessageDate: Date;
  messageCount: number;
}

export interface ContactContext {
  contact: Contact;
  interactions: InteractionSummary;
  recentThreads: RecentThread[];
}

export function getDisplayName(contact: Contact): string {
  return contact.name || contact.email.split("@")[0];
}

export function getInteractionLevel(count: number): "new" | "occasional" | "frequent" {
  if (count < 5) return "new";
  if (count < 20) return "occasional";
  return "frequent";
}
