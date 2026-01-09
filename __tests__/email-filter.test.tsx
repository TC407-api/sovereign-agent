import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailFilterDemo } from '@/components/EmailFilterDemo';

describe('Email Filtering', () => {
  test('filters to show only high priority emails', async () => {
    const user = userEvent.setup();

    render(<EmailFilterDemo />);

    // Initially shows all 3 emails
    expect(screen.getAllByTestId('email-card')).toHaveLength(3);

    // Click "High Priority Only" button
    await user.click(screen.getByRole('button', { name: /high priority/i }));

    // Now shows only 1 email
    expect(screen.getAllByTestId('email-card')).toHaveLength(1);
    expect(screen.getByText(/urgent/i)).toBeInTheDocument();
  });
});
