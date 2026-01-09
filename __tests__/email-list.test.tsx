import { render, screen } from '@testing-library/react';
import { EmailList } from '@/components/EmailList';

describe('EmailList', () => {
  test('displays multiple emails', () => {
    const emails = [
      { id: '1', from: 'alice@company.com', subject: 'Meeting Tomorrow', date: new Date('2026-01-07T12:00:00') },
      { id: '2', from: 'bob@company.com', subject: 'Budget Review', date: new Date('2026-01-06T12:00:00') },
      { id: '3', from: 'carol@company.com', subject: 'Design Feedback', date: new Date('2026-01-05T12:00:00') }
    ];

    render(<EmailList emails={emails} />);

    expect(screen.getByText('alice@company.com')).toBeInTheDocument();
    expect(screen.getByText('bob@company.com')).toBeInTheDocument();
    expect(screen.getByText('carol@company.com')).toBeInTheDocument();
  });
});
