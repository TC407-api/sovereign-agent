'use client';

import { useState } from 'react';
import { Email } from '@/types/email';
import { EmailList } from './EmailList';

// Demo email data for search functionality demonstration
const DEMO_EMAILS: Email[] = [
  {
    id: '1',
    from: 'alice@company.com',
    subject: 'Project Update',
    date: new Date('2026-01-07T12:00:00'),
    priority: 'normal'
  },
  {
    id: '2',
    from: 'bob@company.com',
    subject: 'Budget Review',
    date: new Date('2026-01-06T12:00:00'),
    priority: 'normal'
  },
  {
    id: '3',
    from: 'carol@company.com',
    subject: 'Design Feedback',
    date: new Date('2026-01-05T12:00:00'),
    priority: 'normal'
  }
];

// Filters emails by sender address (case-insensitive)
function searchEmails(emails: Email[], searchTerm: string): Email[] {
  if (!searchTerm) return emails;
  const term = searchTerm.toLowerCase();
  return emails.filter(email => email.from.toLowerCase().includes(term));
}

export function EmailSearchDemo() {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredEmails = searchEmails(DEMO_EMAILS, searchTerm);

  return (
    <div>
      <input
        type="text"
        placeholder="Search by sender..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <EmailList emails={filteredEmails} />
    </div>
  );
}
