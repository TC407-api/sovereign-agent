import { render, screen } from '@testing-library/react';
import { EmailCard } from '@/components/EmailCard';

describe('EmailCard', () => {
  test('displays email sender, subject, and date', () => {
    const email = {
      id: '1',
      from: 'sarah@company.com',
      subject: 'Project Update',
      date: new Date('2026-01-07T12:00:00')
    };

    render(<EmailCard email={email} />);

    expect(screen.getByText('sarah@company.com')).toBeInTheDocument();
    expect(screen.getByText('Project Update')).toBeInTheDocument();
    expect(screen.getByText(/Jan \d+, 2026/)).toBeInTheDocument();
  });

  test('displays priority badge when email has priority', () => {
    const email = {
      id: '1',
      from: 'ceo@company.com',
      subject: 'Urgent: Board Meeting',
      date: new Date('2026-01-07T12:00:00'),
      priority: 'high' as const
    };

    render(<EmailCard email={email} />);

    expect(screen.getByText(/high/i)).toBeInTheDocument();
  });
});
