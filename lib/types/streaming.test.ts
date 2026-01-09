import { describe, expect, test } from 'vitest';
import type {
  StreamingState,
  StreamChunk,
  StreamingComponent,
  StreamProgress,
} from './streaming';
import { isStreamChunk, isComplete, hasError } from './streaming';

describe('Streaming Types', () => {
  test('StreamingState has correct structure', () => {
    const state: StreamingState = {
      status: 'streaming',
      progress: 0.5,
      chunksReceived: 3,
      error: null,
    };

    expect(state.status).toBe('streaming');
    expect(state.progress).toBeGreaterThanOrEqual(0);
    expect(state.progress).toBeLessThanOrEqual(1);
  });

  test('StreamChunk identifies component and data', () => {
    const chunk: StreamChunk = {
      id: 'chunk-1',
      component: 'PrepCard',
      data: { contact: { name: 'John' } },
      isComplete: false,
      timestamp: Date.now(),
    };

    expect(chunk.component).toBe('PrepCard');
    expect(chunk.isComplete).toBe(false);
  });

  test('isStreamChunk type guard works correctly', () => {
    const validChunk = {
      id: 'chunk-1',
      component: 'Test',
      data: {},
      isComplete: true,
      timestamp: Date.now(),
    };
    const invalidObj = { foo: 'bar' };

    expect(isStreamChunk(validChunk)).toBe(true);
    expect(isStreamChunk(invalidObj)).toBe(false);
    expect(isStreamChunk(null)).toBe(false);
  });

  test('isComplete helper function', () => {
    const completeState: StreamingState = {
      status: 'complete',
      progress: 1,
      chunksReceived: 5,
      error: null,
    };
    const streamingState: StreamingState = {
      status: 'streaming',
      progress: 0.5,
      chunksReceived: 2,
      error: null,
    };

    expect(isComplete(completeState)).toBe(true);
    expect(isComplete(streamingState)).toBe(false);
  });

  test('hasError helper function', () => {
    const errorState: StreamingState = {
      status: 'error',
      progress: 0,
      chunksReceived: 0,
      error: new Error('Test error'),
    };
    const okState: StreamingState = {
      status: 'complete',
      progress: 1,
      chunksReceived: 5,
      error: null,
    };

    expect(hasError(errorState)).toBe(true);
    expect(hasError(okState)).toBe(false);
  });
});
