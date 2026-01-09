'use client';

import { useState } from 'react';
import { Email } from '@/types/email';
import { EmailCard } from './EmailCard';
import { EmailDetailView } from './EmailDetailView';

const DEMO_EMAILS: Email[] = [
  {
    id: '1',
    from: 'alice@company.com',
    subject: 'Project Update',
    date: new Date('2026-01-07T12:00:00'),
    priority: 'normal',
    body: 'This is the email body for the project update.'
  }
];

export function EmailDetailDemo() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  return (
    <div>
      <div className="space-y-3 mb-6">
        {DEMO_EMAILS.map(email => (
          <div
            key={email.id}
            onClick={() => setSelectedEmail(email)}
            className="cursor-pointer"
          >
            <EmailCard email={email} />
          </div>
        ))}
      </div>

      {selectedEmail && <EmailDetailView email={selectedEmail} />}
    </div>
  );
}
