/**
 * Calendar Sync Scheduler - Background synchronization with retry logic
 *
 * Provides automatic calendar sync with configurable intervals,
 * exponential backoff on failures, and event-based status updates.
 */

export interface SyncConfig {
  /** Interval between sync attempts in milliseconds */
  intervalMs: number;
  /** Maximum number of retries on failure */
  maxRetries: number;
  /** Delay before first retry in milliseconds */
  retryDelayMs?: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier?: number;
}

export interface SyncResult {
  synced: number;
  updated?: number;
  errors?: number;
}

export interface SyncStatus {
  isRunning: boolean;
  lastSyncTime: number | null;
  nextSyncTime: number | null;
  totalSynced: number;
  totalUpdated: number;
  errorCount: number;
  lastError?: string;
}

type SyncFunction = () => Promise<SyncResult>;
type EventType = 'syncComplete' | 'syncError' | 'syncStart';
type EventHandler = (data: unknown) => void;

export interface SyncScheduler {
  /** Start the background sync scheduler */
  start(syncFn: SyncFunction): void;
  /** Stop the scheduler */
  stop(): void;
  /** Get current sync status */
  getStatus(): SyncStatus;
  /** Manually trigger a sync */
  syncNow(): Promise<SyncResult | null>;
  /** Register an event handler */
  on(event: EventType, handler: EventHandler): void;
  /** Remove an event handler */
  off(event: EventType, handler: EventHandler): void;
}

const DEFAULT_CONFIG: SyncConfig = {
  intervalMs: 300000, // 5 minutes
  maxRetries: 3,
  retryDelayMs: 1000,
  backoffMultiplier: 2,
};

/**
 * Create a new sync scheduler instance
 */
export function createSyncScheduler(config: Partial<SyncConfig> = {}): SyncScheduler {
  const mergedConfig: SyncConfig = { ...DEFAULT_CONFIG, ...config };

  let isRunning = false;
  let syncFn: SyncFunction | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // Status tracking
  let lastSyncTime: number | null = null;
  let nextSyncTime: number | null = null;
  let totalSynced = 0;
  let totalUpdated = 0;
  let errorCount = 0;
  let lastError: string | undefined;

  // Event handlers
  const eventHandlers: Map<EventType, Set<EventHandler>> = new Map();

  function emit(event: EventType, data: unknown): void {
    const handlers = eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  async function executeSync(retryCount = 0): Promise<SyncResult | null> {
    if (!syncFn) return null;

    emit('syncStart', { retryCount });

    try {
      const result = await syncFn();

      // Update status on success
      lastSyncTime = Date.now();
      totalSynced += result.synced;
      totalUpdated += result.updated || 0;
      lastError = undefined;

      emit('syncComplete', result);
      return result;
    } catch (error) {
      errorCount++;
      lastError = error instanceof Error ? error.message : 'Unknown error';

      emit('syncError', { error, retryCount });

      // Retry logic with exponential backoff
      if (retryCount < mergedConfig.maxRetries) {
        const delay =
          (mergedConfig.retryDelayMs || 1000) *
          Math.pow(mergedConfig.backoffMultiplier || 2, retryCount);

        await new Promise((resolve) => {
          retryTimeoutId = setTimeout(resolve, delay);
        });

        return executeSync(retryCount + 1);
      }

      return null;
    }
  }

  function start(fn: SyncFunction): void {
    if (isRunning) return;

    syncFn = fn;
    isRunning = true;

    // Execute immediately
    executeSync();

    // Set up interval
    nextSyncTime = Date.now() + mergedConfig.intervalMs;
    intervalId = setInterval(() => {
      executeSync();
      nextSyncTime = Date.now() + mergedConfig.intervalMs;
    }, mergedConfig.intervalMs);
  }

  function stop(): void {
    isRunning = false;

    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (retryTimeoutId) {
      clearTimeout(retryTimeoutId);
      retryTimeoutId = null;
    }

    nextSyncTime = null;
  }

  function getStatus(): SyncStatus {
    return {
      isRunning,
      lastSyncTime,
      nextSyncTime,
      totalSynced,
      totalUpdated,
      errorCount,
      lastError,
    };
  }

  async function syncNow(): Promise<SyncResult | null> {
    return executeSync();
  }

  function on(event: EventType, handler: EventHandler): void {
    if (!eventHandlers.has(event)) {
      eventHandlers.set(event, new Set());
    }
    eventHandlers.get(event)!.add(handler);
  }

  function off(event: EventType, handler: EventHandler): void {
    const handlers = eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  return {
    start,
    stop,
    getStatus,
    syncNow,
    on,
    off,
  };
}

/**
 * Pre-configured sync schedulers for common use cases
 */
export const syncSchedulers = {
  /** Fast sync for active usage: every 1 minute */
  fast: () =>
    createSyncScheduler({
      intervalMs: 60000,
      maxRetries: 2,
      retryDelayMs: 500,
    }),

  /** Normal sync: every 5 minutes */
  normal: () =>
    createSyncScheduler({
      intervalMs: 300000,
      maxRetries: 3,
      retryDelayMs: 1000,
    }),

  /** Background sync: every 15 minutes */
  background: () =>
    createSyncScheduler({
      intervalMs: 900000,
      maxRetries: 5,
      retryDelayMs: 2000,
      backoffMultiplier: 2,
    }),
};
