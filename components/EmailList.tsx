import { Email } from '@/types/email';
import { EmailCard } from './EmailCard';

function sortByDate(emails: Email[]): Email[] {
  return [...emails].sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function EmailList({ emails }: { emails: Email[] }) {
  const sortedEmails = sortByDate(emails);

  return (
    <div className="space-y-3">
      {sortedEmails.map(email => (
        <EmailCard key={email.id} email={email} />
      ))}
    </div>
  );
}
