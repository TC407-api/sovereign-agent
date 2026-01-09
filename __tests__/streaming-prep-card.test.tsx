import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { StreamingPrepCard } from '@/components/streaming/StreamingPrepCard';

describe('StreamingPrepCard', () => {
  test('shows skeleton when loading', () => {
    const { container } = render(<StreamingPrepCard isLoading={true} />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  test('renders contact name and email when data provided', () => {
    render(
      <StreamingPrepCard
        isLoading={false}
        data={{
          name: 'Jane Doe',
          email: 'jane@example.com',
          interactionLevel: 'high',
          commonTopics: ['engineering'],
          recentThreadCount: 5,
        }}
      />
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  test('shows streaming indicator when partially loaded', () => {
    render(
      <StreamingPrepCard
        isLoading={false}
        isStreaming={true}
        data={{
          name: 'Jane Doe',
          email: 'jane@example.com',
          interactionLevel: 'medium',
          commonTopics: [],
          recentThreadCount: 0,
        }}
      />
    );

    expect(screen.getByText(/streaming/i)).toBeInTheDocument();
  });

  test('displays interaction level badge', () => {
    render(
      <StreamingPrepCard
        isLoading={false}
        data={{
          name: 'Test User',
          email: 'test@example.com',
          interactionLevel: 'high',
          commonTopics: ['meetings', 'projects'],
          recentThreadCount: 10,
        }}
      />
    );

    expect(screen.getByText('high')).toBeInTheDocument();
  });

  test('shows common topics as tags', () => {
    render(
      <StreamingPrepCard
        isLoading={false}
        data={{
          name: 'Test User',
          email: 'test@example.com',
          interactionLevel: 'low',
          commonTopics: ['budgets', 'planning'],
          recentThreadCount: 2,
        }}
      />
    );

    expect(screen.getByText('budgets')).toBeInTheDocument();
    expect(screen.getByText('planning')).toBeInTheDocument();
  });
});
