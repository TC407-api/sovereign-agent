import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStreaming } from './useStreaming';
import type { StreamingState } from '@/lib/types/streaming';

describe('useStreaming Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('initializes with pending state', () => {
    const { result } = renderHook(() => useStreaming());

    expect(result.current.state.status).toBe('pending');
    expect(result.current.state.progress).toBe(0);
    expect(result.current.state.chunksReceived).toBe(0);
    expect(result.current.state.error).toBeNull();
  });

  test('startStreaming sets status to streaming', () => {
    const { result } = renderHook(() => useStreaming());

    act(() => {
      result.current.startStreaming();
    });

    expect(result.current.state.status).toBe('streaming');
  });

  test('receiveChunk increments chunk count', () => {
    const { result } = renderHook(() => useStreaming());

    act(() => {
      result.current.startStreaming();
      result.current.receiveChunk({
        id: 'chunk-1',
        component: 'Test',
        data: {},
        isComplete: false,
        timestamp: Date.now(),
      });
    });

    expect(result.current.state.chunksReceived).toBe(1);
  });

  test('complete sets status to complete', () => {
    const { result } = renderHook(() => useStreaming());

    act(() => {
      result.current.startStreaming();
      result.current.complete();
    });

    expect(result.current.state.status).toBe('complete');
    expect(result.current.state.progress).toBe(1);
  });

  test('setError sets error state', () => {
    const { result } = renderHook(() => useStreaming());
    const error = new Error('Test error');

    act(() => {
      result.current.setError(error);
    });

    expect(result.current.state.status).toBe('error');
    expect(result.current.state.error).toBe(error);
  });

  test('reset returns to initial state', () => {
    const { result } = renderHook(() => useStreaming());

    act(() => {
      result.current.startStreaming();
      result.current.receiveChunk({
        id: 'chunk-1',
        component: 'Test',
        data: {},
        isComplete: false,
        timestamp: Date.now(),
      });
      result.current.reset();
    });

    expect(result.current.state.status).toBe('pending');
    expect(result.current.state.chunksReceived).toBe(0);
  });
});
