import { Email } from '@/types/email';

export function EmailDetailView({ email }: { email: Email }) {
  return (
    <div className="border-t pt-6">
      <h2 className="text-xl font-bold mb-2">{email.subject}</h2>
      <p className="text-sm text-slate-600 mb-4">From: {email.from}</p>
      <div className="prose max-w-none">
        {email.body}
      </div>
    </div>
  );
}
