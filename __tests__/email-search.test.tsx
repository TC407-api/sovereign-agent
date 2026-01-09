import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailSearchDemo } from '@/components/EmailSearchDemo';

describe('Email Search', () => {
  test('filters emails by sender name', async () => {
    const user = userEvent.setup();

    render(<EmailSearchDemo />);

    // Initially shows all emails
    expect(screen.getAllByTestId('email-card').length).toBeGreaterThan(1);

    // Type in search box
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'alice');

    // Should show only alice's email
    expect(screen.getAllByTestId('email-card')).toHaveLength(1);
    expect(screen.getByText(/alice@/i)).toBeInTheDocument();
  });

  test('clears search results when input is cleared', async () => {
    const user = userEvent.setup();

    render(<EmailSearchDemo />);

    const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
    await user.type(searchInput, 'bob');

    // Shows only bob's email
    expect(screen.getAllByTestId('email-card')).toHaveLength(1);

    // Clear the search
    await user.clear(searchInput);

    // Shows all emails again
    expect(screen.getAllByTestId('email-card').length).toBeGreaterThan(1);
  });

  test('handles search with no matches gracefully', async () => {
    const user = userEvent.setup();

    render(<EmailSearchDemo />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'nonexistent@domain.com');

    // Shows no emails
    expect(screen.queryAllByTestId('email-card')).toHaveLength(0);
  });

  test('search is case insensitive', async () => {
    const user = userEvent.setup();

    render(<EmailSearchDemo />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'CAROL');

    // Should find carol@company.com despite uppercase input
    expect(screen.getAllByTestId('email-card')).toHaveLength(1);
    expect(screen.getByText(/carol@/i)).toBeInTheDocument();
  });
});
