import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimisticUpdate } from './useOptimisticUpdate';

describe('useOptimisticUpdate Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('initializes with provided initial data', () => {
    const { result } = renderHook(() =>
      useOptimisticUpdate({ count: 0 })
    );
    expect(result.current.data).toEqual({ count: 0 });
    expect(result.current.isPending).toBe(false);
  });

  test('applies optimistic update immediately', () => {
    const { result } = renderHook(() =>
      useOptimisticUpdate({ count: 0 })
    );

    act(() => {
      result.current.update({ count: 5 }, async () => {});
    });

    expect(result.current.data).toEqual({ count: 5 });
    expect(result.current.isPending).toBe(true);
  });

  test('reverts on mutation failure', async () => {
    const { result } = renderHook(() =>
      useOptimisticUpdate({ count: 0 })
    );

    await act(async () => {
      await result.current.update({ count: 5 }, async () => {
        throw new Error('Failed');
      }).catch(() => {});
    });

    expect(result.current.data).toEqual({ count: 0 });
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeDefined();
  });

  test('confirms update on mutation success', async () => {
    const { result } = renderHook(() =>
      useOptimisticUpdate({ count: 0 })
    );

    await act(async () => {
      await result.current.update({ count: 5 }, async () => {
        return { count: 5 };
      });
    });

    expect(result.current.data).toEqual({ count: 5 });
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('reset clears error and pending state', async () => {
    const { result } = renderHook(() =>
      useOptimisticUpdate({ count: 0 })
    );

    await act(async () => {
      await result.current.update({ count: 5 }, async () => {
        throw new Error('Failed');
      }).catch(() => {});
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isPending).toBe(false);
  });
});
