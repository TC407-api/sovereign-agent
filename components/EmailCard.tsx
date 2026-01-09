import { Email } from '@/types/email';
import { PriorityBadge } from './PriorityBadge';

export function EmailCard({ email }: { email: Email }) {
  return (
    <div data-testid="email-card" className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">{email.from}</div>
        {email.priority && <PriorityBadge priority={email.priority} />}
      </div>
      <div className="font-semibold text-slate-900 mt-1">{email.subject}</div>
      <div className="text-xs text-slate-500 mt-2">
        {email.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}
      </div>
    </div>
  );
}
