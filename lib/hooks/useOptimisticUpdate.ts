'use client';

import { useState, useCallback, useRef } from 'react';

interface UseOptimisticUpdateResult<T> {
  data: T;
  isPending: boolean;
  error: Error | null;
  update: (optimisticData: T, mutation: () => Promise<T | void>) => Promise<void>;
  reset: () => void;
}

export function useOptimisticUpdate<T>(initialData: T): UseOptimisticUpdateResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const previousDataRef = useRef<T>(initialData);

  const update = useCallback(
    async (optimisticData: T, mutation: () => Promise<T | void>) => {
      // Store previous data for rollback
      previousDataRef.current = data;

      // Apply optimistic update immediately
      setData(optimisticData);
      setIsPending(true);
      setError(null);

      try {
        // Execute the actual mutation
        const result = await mutation();

        // If mutation returns data, use it; otherwise keep optimistic data
        if (result !== undefined) {
          setData(result);
        }

        setIsPending(false);
      } catch (err) {
        // Rollback on failure
        setData(previousDataRef.current);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsPending(false);
        throw err;
      }
    },
    [data]
  );

  const reset = useCallback(() => {
    setError(null);
    setIsPending(false);
  }, []);

  return {
    data,
    isPending,
    error,
    update,
    reset,
  };
}
