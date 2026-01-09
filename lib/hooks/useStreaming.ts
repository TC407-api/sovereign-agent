'use client';

import { useState, useCallback } from 'react';
import type { StreamingState, StreamChunk } from '@/lib/types/streaming';

const initialState: StreamingState = {
  status: 'pending',
  progress: 0,
  chunksReceived: 0,
  error: null,
};

export function useStreaming() {
  const [state, setState] = useState<StreamingState>(initialState);
  const [chunks, setChunks] = useState<StreamChunk[]>([]);

  const startStreaming = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'streaming',
      progress: 0,
      error: null,
      chunksReceived: 0,
    }));
    setChunks([]);
  }, []);

  const receiveChunk = useCallback((chunk: StreamChunk) => {
    setChunks((prev) => [...prev, chunk]);
    setState((prev) => ({
      ...prev,
      chunksReceived: prev.chunksReceived + 1,
    }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState((prev) => ({
      ...prev,
      progress: Math.min(1, Math.max(0, progress)),
    }));
  }, []);

  const complete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'complete',
      progress: 1,
    }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState((prev) => ({
      ...prev,
      status: 'error',
      error,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    setChunks([]);
  }, []);

  return {
    state,
    chunks,
    startStreaming,
    receiveChunk,
    setProgress,
    complete,
    setError,
    reset,
  };
}
