'use client';

import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { Email } from '@/types/email';
import { Calendar, User } from 'lucide-react';

// Check if string contains HTML tags
function isHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

// Strip HTML tags and decode entities for plain text preview
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

// Clean up plain text emails - normalize whitespace and formatting
function formatPlainText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function EmailDetailView({ email }: { email: Email }) {
  const isHtmlEmail = useMemo(() => isHtml(email.body), [email.body]);

  const sanitizedHtml = useMemo(() => {
    if (!isHtmlEmail) return null;

    // Configure DOMPurify to be safe but preserve styling
    return DOMPurify.sanitize(email.body, {
      ALLOWED_TAGS: [
        'p', 'br', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
        'table', 'thead', 'tbody', 'tr', 'td', 'th', 'div', 'span', 'img',
        'hr', 'sub', 'sup'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'width', 'height'],
      ALLOW_DATA_ATTR: false,
      ADD_ATTR: ['target'],
    });
  }, [email.body, isHtmlEmail]);

  const formattedText = useMemo(() => {
    if (isHtmlEmail) return null;
    return formatPlainText(email.body);
  }, [email.body, isHtmlEmail]);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Email Header */}
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">{email.subject}</h2>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <User className="w-4 h-4 text-slate-500" />
            <span className="font-medium">{email.from}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{email.date.toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div className="p-6">
        {isHtmlEmail ? (
          <div
            className="email-html-content prose prose-invert prose-slate max-w-none
              prose-headings:text-white prose-headings:font-semibold
              prose-p:text-slate-300 prose-p:leading-relaxed
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-em:text-slate-200
              prose-blockquote:border-slate-600 prose-blockquote:text-slate-400
              prose-code:text-emerald-400 prose-code:bg-slate-700/50 prose-code:px-1 prose-code:rounded
              prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700
              prose-li:text-slate-300
              prose-table:border-slate-700
              prose-th:text-slate-200 prose-th:bg-slate-700/50
              prose-td:text-slate-300 prose-td:border-slate-700
              prose-img:rounded-lg prose-img:max-w-full
              prose-hr:border-slate-700"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml || '' }}
          />
        ) : (
          <div className="text-slate-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
            {formattedText}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact preview for email lists
export function EmailPreview({ body, maxLength = 120 }: { body: string; maxLength?: number }) {
  const preview = useMemo(() => {
    const text = isHtml(body) ? stripHtml(body) : body;
    const cleaned = text.replace(/\s+/g, ' ').trim();
    return cleaned.length > maxLength ? cleaned.slice(0, maxLength) + '...' : cleaned;
  }, [body, maxLength]);

  return <span className="text-slate-500">{preview}</span>;
}
