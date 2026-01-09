'use client';

import { useState } from 'react';
import { Email } from '@/types/email';
import { EmailList } from './EmailList';

// Hardcoded demo emails
const DEMO_EMAILS: Email[] = [
  {
    id: '1',
    from: 'ceo@company.com',
    subject: 'Urgent: Board Meeting',
    date: new Date('2026-01-07T12:00:00'),
    priority: 'high'
  },
  {
    id: '2',
    from: 'alice@company.com',
    subject: 'Project Update',
    date: new Date('2026-01-06T12:00:00'),
    priority: 'normal'
  },
  {
    id: '3',
    from: 'bob@company.com',
    subject: 'Budget Review',
    date: new Date('2026-01-05T12:00:00'),
    priority: 'normal'
  }
];

function filterEmails(emails: Email[], highPriorityOnly: boolean): Email[] {
  if (!highPriorityOnly) return emails;
  return emails.filter(e => e.priority === 'high');
}

export function EmailFilterDemo() {
  const [showHighOnly, setShowHighOnly] = useState(false);
  const filteredEmails = filterEmails(DEMO_EMAILS, showHighOnly);

  return (
    <div>
      <button
        onClick={() => setShowHighOnly(!showHighOnly)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {showHighOnly ? 'Show All' : 'High Priority Only'}
      </button>
      <EmailList emails={filteredEmails} />
    </div>
  );
}
