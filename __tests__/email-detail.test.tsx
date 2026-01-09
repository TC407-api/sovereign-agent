import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailDetailDemo } from '@/components/EmailDetailDemo';

describe('Email Detail View', () => {
  test('shows email body when clicked', async () => {
    const user = userEvent.setup();

    render(<EmailDetailDemo />);

    // Email body not visible initially
    expect(screen.queryByText(/This is the email body/i)).not.toBeInTheDocument();

    // Click first email
    const firstEmail = screen.getAllByTestId('email-card')[0];
    await user.click(firstEmail);

    // Email body now visible
    expect(screen.getByText(/This is the email body/i)).toBeInTheDocument();
  });
});
