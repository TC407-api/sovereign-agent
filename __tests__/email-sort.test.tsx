import { render, screen } from '@testing-library/react';
import { EmailList } from '@/components/EmailList';
import { Email } from '@/types/email';

describe('Email Sorting', () => {
  test('should display emails with newest first when given unsorted emails', () => {
    const emails: Email[] = [
      { id: '1', from: 'old@test.com', subject: 'Old', date: new Date('2026-01-01T12:00:00'), priority: 'normal' },
      { id: '2', from: 'new@test.com', subject: 'New', date: new Date('2026-01-07T12:00:00'), priority: 'normal' },
      { id: '3', from: 'mid@test.com', subject: 'Mid', date: new Date('2026-01-04T12:00:00'), priority: 'normal' }
    ];

    render(<EmailList emails={emails} />);

    const cards = screen.getAllByTestId('email-card');

    // First card should be newest
    expect(cards[0]).toHaveTextContent('new@test.com');
    // Last card should be oldest
    expect(cards[2]).toHaveTextContent('old@test.com');
  });

  test('should maintain correct order for emails with same date', () => {
    const emails: Email[] = [
      { id: '1', from: 'first@test.com', subject: 'First', date: new Date('2026-01-05T10:00:00') },
      { id: '2', from: 'second@test.com', subject: 'Second', date: new Date('2026-01-05T10:00:00') }
    ];

    render(<EmailList emails={emails} />);

    const cards = screen.getAllByTestId('email-card');
    expect(cards[0]).toHaveTextContent('first@test.com');
    expect(cards[1]).toHaveTextContent('second@test.com');
  });

  test('should handle empty email list', () => {
    const emails: Email[] = [];

    render(<EmailList emails={emails} />);

    const cards = screen.queryAllByTestId('email-card');
    expect(cards).toHaveLength(0);
  });

  test('should handle single email', () => {
    const emails: Email[] = [
      { id: '1', from: 'solo@test.com', subject: 'Solo', date: new Date('2026-01-05T12:00:00') }
    ];

    render(<EmailList emails={emails} />);

    const cards = screen.getAllByTestId('email-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('solo@test.com');
  });
});
