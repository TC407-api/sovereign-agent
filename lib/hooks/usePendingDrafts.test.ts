/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePendingDrafts } from './usePendingDrafts';

// Mock Convex useQuery
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}));

import { useQuery } from 'convex/react';

const mockUseQuery = useQuery as ReturnType<typeof vi.fn>;

describe('usePendingDrafts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    mockUseQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => usePendingDrafts());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.drafts).toEqual([]);
  });

  it('should return drafts when loaded', () => {
    const mockDrafts = [
      {
        _id: 'draft-1',
        subject: 'Re: Test',
        body: 'Test body',
        generatedAt: Date.now(),
        status: 'draft',
        editCount: 0,
        email: { _id: 'email-1', from: 'test@example.com', subject: 'Test' },
      },
    ];
    mockUseQuery.mockReturnValue(mockDrafts);

    const { result } = renderHook(() => usePendingDrafts());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.drafts).toEqual(mockDrafts);
    expect(result.current.count).toBe(1);
  });

  it('should return empty array when no drafts', () => {
    mockUseQuery.mockReturnValue([]);

    const { result } = renderHook(() => usePendingDrafts());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.drafts).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('should provide hasPendingDrafts boolean', () => {
    const mockDrafts = [{ _id: 'draft-1', subject: 'Test' }];
    mockUseQuery.mockReturnValue(mockDrafts);

    const { result } = renderHook(() => usePendingDrafts());

    expect(result.current.hasPendingDrafts).toBe(true);
  });

  it('should return hasPendingDrafts false when empty', () => {
    mockUseQuery.mockReturnValue([]);

    const { result } = renderHook(() => usePendingDrafts());

    expect(result.current.hasPendingDrafts).toBe(false);
  });
});
