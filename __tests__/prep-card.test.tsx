import { render, screen } from '@testing-library/react';
import { PrepCard, type ContactContext } from '@/components/PrepCard';
import { describe, test, expect } from 'vitest';

describe('PrepCard', () => {
  const mockContext: ContactContext = {
    name: 'John Doe',
    email: 'john@example.com',
    interactionLevel: 'high',
    commonTopics: ['React', 'TypeScript', 'TDD'],
    recentThreadCount: 5,
  };

  test('displays contact name and email', () => {
    render(<PrepCard context={mockContext} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  test('shows interaction level badge', () => {
    render(<PrepCard context={mockContext} />);
    const badge = screen.getByText(/high/i);
    expect(badge).toBeInTheDocument();
  });

  test('displays common topics', () => {
    render(<PrepCard context={mockContext} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('TDD')).toBeInTheDocument();
  });

  test('shows recent thread count', () => {
    render(<PrepCard context={mockContext} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText(/recent threads/i)).toBeInTheDocument();
  });
});
