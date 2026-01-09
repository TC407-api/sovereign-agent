import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSidecarContext } from './useSidecarContext';

// Mock Convex queries
const mockContactData = {
  _id: 'contact-1' as any,
  email: 'john@example.com',
  name: 'John Doe',
  company: 'Tech Corp',
  role: 'Engineer',
  lastInteraction: Date.now(),
  interactionCount: 10,
  commonTopics: ['engineering', 'code review'],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const mockEmails = [
  {
    _id: 'email-1' as any,
    threadId: 'thread-1',
    subject: 'Project Update',
    from: 'john@example.com',
    to: ['me@example.com'],
    body: 'Here is the update...',
    receivedAt: Date.now(),
    priority: 'medium' as const,
    status: 'read' as const,
    createdAt: Date.now(),
    labels: [],
  },
];

let mockContactReturnValue: any = undefined;
let mockEmailsReturnValue: any = undefined;

// Track which query is being called
let queryCallCount = 0;

vi.mock('convex/react', () => ({
  useQuery: vi.fn((_queryFn: any, args: any) => {
    // Skip case
    if (args === 'skip') return undefined;

    queryCallCount++;
    // First call is contact, second call is emails
    if (queryCallCount % 2 === 1) {
      return mockContactReturnValue;
    }
    return mockEmailsReturnValue;
  }),
}));

describe('useSidecarContext Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContactReturnValue = undefined;
    mockEmailsReturnValue = undefined;
    queryCallCount = 0;
  });

  test('returns null context when no email is selected', () => {
    const { result } = renderHook(() => useSidecarContext(null));

    expect(result.current.contactContext).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  test('returns loading state while fetching', () => {
    mockContactReturnValue = undefined;
    mockEmailsReturnValue = undefined;

    const { result } = renderHook(() => useSidecarContext('john@example.com'));

    expect(result.current.isLoading).toBe(true);
  });

  test('returns contact context when data is loaded', () => {
    mockContactReturnValue = mockContactData;
    mockEmailsReturnValue = mockEmails;

    const { result } = renderHook(() => useSidecarContext('john@example.com'));

    expect(result.current.contactContext).not.toBeNull();
    expect(result.current.contactContext?.contact.email).toBe('john@example.com');
  });

  test('calculates interaction summary correctly', () => {
    mockContactReturnValue = mockContactData;
    mockEmailsReturnValue = mockEmails;

    const { result } = renderHook(() => useSidecarContext('john@example.com'));

    if (result.current.contactContext) {
      expect(result.current.contactContext.interactions).toBeDefined();
      expect(result.current.contactContext.interactions.totalEmails).toBe(1);
    }
  });

  test('updates context when selected email changes', () => {
    mockContactReturnValue = mockContactData;
    mockEmailsReturnValue = mockEmails;

    const { result, rerender } = renderHook(
      ({ email }) => useSidecarContext(email),
      { initialProps: { email: 'john@example.com' as string | null } }
    );

    expect(result.current.contactContext?.contact.email).toBe('john@example.com');

    // Change to null
    rerender({ email: null });
    expect(result.current.contactContext).toBeNull();
  });
});
