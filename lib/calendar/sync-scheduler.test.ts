import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  SyncScheduler,
  createSyncScheduler,
  SyncConfig,
  SyncStatus,
} from './sync-scheduler';

describe('Calendar Sync Scheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createSyncScheduler', () => {
    it('should create a scheduler with default config', () => {
      const scheduler = createSyncScheduler();
      expect(scheduler).toBeDefined();
      expect(scheduler.start).toBeDefined();
      expect(scheduler.stop).toBeDefined();
      expect(scheduler.getStatus).toBeDefined();
    });

    it('should create a scheduler with custom config', () => {
      const config: SyncConfig = {
        intervalMs: 60000,
        maxRetries: 3,
        backoffMultiplier: 2,
      };
      const scheduler = createSyncScheduler(config);
      expect(scheduler).toBeDefined();
    });
  });

  describe('SyncScheduler', () => {
    it('should start and stop the scheduler', () => {
      const syncFn = vi.fn().mockResolvedValue({ synced: 5 });
      const scheduler = createSyncScheduler({ intervalMs: 1000 });

      scheduler.start(syncFn);
      expect(scheduler.getStatus().isRunning).toBe(true);

      scheduler.stop();
      expect(scheduler.getStatus().isRunning).toBe(false);
    });

    it('should execute sync function at specified interval', async () => {
      const syncFn = vi.fn().mockResolvedValue({ synced: 5 });
      const scheduler = createSyncScheduler({ intervalMs: 1000 });

      scheduler.start(syncFn);

      // Initial call
      expect(syncFn).toHaveBeenCalledTimes(1);

      // Advance time
      await vi.advanceTimersByTimeAsync(1000);
      expect(syncFn).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(1000);
      expect(syncFn).toHaveBeenCalledTimes(3);

      scheduler.stop();
    });

    it('should handle sync failures with retry', async () => {
      const syncFn = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({ synced: 5 });

      const scheduler = createSyncScheduler({
        intervalMs: 1000,
        maxRetries: 3,
        retryDelayMs: 500,
      });

      scheduler.start(syncFn);

      // First call fails
      await vi.advanceTimersByTimeAsync(100);

      // Retry after delay
      await vi.advanceTimersByTimeAsync(500);
      expect(syncFn).toHaveBeenCalledTimes(2);

      scheduler.stop();
    });

    it('should track sync status', async () => {
      const syncFn = vi.fn().mockResolvedValue({ synced: 10, updated: 3 });
      const scheduler = createSyncScheduler({ intervalMs: 1000 });

      scheduler.start(syncFn);
      await vi.advanceTimersByTimeAsync(100);

      const status = scheduler.getStatus();
      expect(status.lastSyncTime).toBeDefined();
      expect(status.totalSynced).toBe(10);
      expect(status.totalUpdated).toBe(3);

      scheduler.stop();
    });

    it('should track error count', async () => {
      const syncFn = vi.fn()
        .mockRejectedValue(new Error('Always fails'));

      const scheduler = createSyncScheduler({
        intervalMs: 1000,
        maxRetries: 2,
        retryDelayMs: 100,
      });

      scheduler.start(syncFn);

      // Wait for initial call and retries
      await vi.advanceTimersByTimeAsync(500);

      const status = scheduler.getStatus();
      expect(status.errorCount).toBeGreaterThan(0);

      scheduler.stop();
    });

    it('should support manual sync trigger', async () => {
      const syncFn = vi.fn().mockResolvedValue({ synced: 5 });
      const scheduler = createSyncScheduler({ intervalMs: 60000 });

      scheduler.start(syncFn);

      // Manually trigger sync
      await scheduler.syncNow();

      // Should have been called twice (initial + manual)
      expect(syncFn).toHaveBeenCalledTimes(2);

      scheduler.stop();
    });

    it('should emit events on sync completion', async () => {
      const syncFn = vi.fn().mockResolvedValue({ synced: 5 });
      const onComplete = vi.fn();

      const scheduler = createSyncScheduler({ intervalMs: 1000 });
      scheduler.on('syncComplete', onComplete);

      scheduler.start(syncFn);
      await vi.advanceTimersByTimeAsync(100);

      expect(onComplete).toHaveBeenCalledWith({ synced: 5 });

      scheduler.stop();
    });

    it('should emit events on sync error', async () => {
      const error = new Error('Sync failed');
      const syncFn = vi.fn().mockRejectedValue(error);
      const onError = vi.fn();

      const scheduler = createSyncScheduler({
        intervalMs: 1000,
        maxRetries: 1,
      });
      scheduler.on('syncError', onError);

      scheduler.start(syncFn);
      await vi.advanceTimersByTimeAsync(200);

      expect(onError).toHaveBeenCalled();

      scheduler.stop();
    });
  });

  describe('SyncStatus', () => {
    it('should have all required fields', () => {
      const status: SyncStatus = {
        isRunning: true,
        lastSyncTime: Date.now(),
        nextSyncTime: Date.now() + 60000,
        totalSynced: 100,
        totalUpdated: 20,
        errorCount: 0,
      };

      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('lastSyncTime');
      expect(status).toHaveProperty('nextSyncTime');
      expect(status).toHaveProperty('totalSynced');
      expect(status).toHaveProperty('totalUpdated');
      expect(status).toHaveProperty('errorCount');
    });
  });
});
