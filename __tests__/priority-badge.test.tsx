import { render, screen } from '@testing-library/react';
import { PriorityBadge } from '@/components/PriorityBadge';

describe('PriorityBadge', () => {
  test('shows red badge for high priority', () => {
    render(<PriorityBadge priority="high" />);
    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByTestId('priority-badge')).toHaveClass('bg-red-100');
  });

  test('shows yellow badge for medium priority', () => {
    render(<PriorityBadge priority="medium" />);
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
    expect(screen.getByTestId('priority-badge')).toHaveClass('bg-yellow-100');
  });

  test('shows gray badge for normal priority', () => {
    render(<PriorityBadge priority="normal" />);
    expect(screen.getByText(/normal/i)).toBeInTheDocument();
    expect(screen.getByTestId('priority-badge')).toHaveClass('bg-slate-100');
  });
});
