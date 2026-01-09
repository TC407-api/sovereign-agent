import { describe, it, expect, vi } from 'vitest';
import {
  AppError,
  createAppError,
  isAppError,
  handleError,
  ErrorCode,
  ErrorSeverity,
  withRetry,
  RetryConfig,
} from './error-handler';

describe('AppError', () => {
  it('should create an AppError with required fields', () => {
    const error = new AppError({
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
    });

    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Invalid input');
    expect(error.severity).toBe('error'); // default
    expect(error.retryable).toBe(false); // default
  });

  it('should include optional fields', () => {
    const error = new AppError({
      code: 'API_ERROR',
      message: 'API request failed',
      severity: 'critical',
      retryable: true,
      context: { endpoint: '/api/test' },
      cause: new Error('Network error'),
    });

    expect(error.severity).toBe('critical');
    expect(error.retryable).toBe(true);
    expect(error.context).toEqual({ endpoint: '/api/test' });
    expect(error.cause).toBeInstanceOf(Error);
  });

  it('should be an instance of Error', () => {
    const error = new AppError({
      code: 'UNKNOWN_ERROR',
      message: 'Something went wrong',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it('should have a timestamp', () => {
    const before = Date.now();
    const error = new AppError({
      code: 'TEST_ERROR',
      message: 'Test',
    });
    const after = Date.now();

    expect(error.timestamp).toBeGreaterThanOrEqual(before);
    expect(error.timestamp).toBeLessThanOrEqual(after);
  });
});

describe('createAppError', () => {
  it('should create an AppError from an object', () => {
    const error = createAppError({
      code: 'AUTH_ERROR',
      message: 'Unauthorized',
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('AUTH_ERROR');
  });

  it('should wrap a plain Error', () => {
    const plainError = new Error('Plain error');
    const appError = createAppError(plainError);

    expect(appError).toBeInstanceOf(AppError);
    expect(appError.message).toBe('Plain error');
    expect(appError.cause).toBe(plainError);
  });

  it('should return AppError unchanged', () => {
    const original = new AppError({
      code: 'ORIGINAL',
      message: 'Original error',
    });
    const result = createAppError(original);

    expect(result).toBe(original);
  });
});

describe('isAppError', () => {
  it('should return true for AppError', () => {
    const error = new AppError({
      code: 'TEST',
      message: 'Test',
    });

    expect(isAppError(error)).toBe(true);
  });

  it('should return false for plain Error', () => {
    const error = new Error('Plain');
    expect(isAppError(error)).toBe(false);
  });

  it('should return false for non-errors', () => {
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError('string')).toBe(false);
    expect(isAppError({ code: 'FAKE' })).toBe(false);
  });
});

describe('handleError', () => {
  it('should log error and return user-friendly message', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = handleError(new AppError({
      code: 'DATABASE_ERROR',
      message: 'Connection failed',
    }));

    expect(result.userMessage).toBeDefined();
    expect(result.errorId).toBeDefined();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should provide different messages for different severities', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const warningResult = handleError(new AppError({
      code: 'WARNING',
      message: 'Minor issue',
      severity: 'warning',
    }));

    const criticalResult = handleError(new AppError({
      code: 'CRITICAL',
      message: 'System failure',
      severity: 'critical',
    }));

    expect(warningResult.userMessage).not.toBe(criticalResult.userMessage);

    consoleSpy.mockRestore();
  });
});

describe('withRetry', () => {
  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const result = await withRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('First fail'))
      .mockRejectedValueOnce(new Error('Second fail'))
      .mockResolvedValue('success');

    const config: RetryConfig = {
      maxAttempts: 3,
      initialDelayMs: 10,
    };

    const result = await withRetry(fn, config);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Always fails'));

    const config: RetryConfig = {
      maxAttempts: 3,
      initialDelayMs: 10,
    };

    await expect(withRetry(fn, config)).rejects.toThrow('Always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const config: RetryConfig = {
      maxAttempts: 3,
      initialDelayMs: 100,
      backoffMultiplier: 2,
    };

    const start = Date.now();
    await withRetry(fn, config);
    const elapsed = Date.now() - start;

    // Should have waited at least 100 + 200 = 300ms
    expect(elapsed).toBeGreaterThanOrEqual(250);
  });

  it('should not retry non-retryable errors', async () => {
    const nonRetryableError = new AppError({
      code: 'VALIDATION',
      message: 'Invalid input',
      retryable: false,
    });
    const fn = vi.fn().mockRejectedValue(nonRetryableError);

    const config: RetryConfig = {
      maxAttempts: 3,
      initialDelayMs: 10,
    };

    await expect(withRetry(fn, config)).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call onRetry callback', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValue('success');

    const onRetry = vi.fn();

    const config: RetryConfig = {
      maxAttempts: 3,
      initialDelayMs: 10,
      onRetry,
    };

    await withRetry(fn, config);

    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });
});

describe('ErrorCode', () => {
  it('should have common error codes defined', () => {
    expect(ErrorCode.VALIDATION_ERROR).toBeDefined();
    expect(ErrorCode.AUTH_ERROR).toBeDefined();
    expect(ErrorCode.NOT_FOUND).toBeDefined();
    expect(ErrorCode.NETWORK_ERROR).toBeDefined();
    expect(ErrorCode.RATE_LIMITED).toBeDefined();
  });
});

describe('ErrorSeverity', () => {
  it('should have severity levels defined', () => {
    expect(ErrorSeverity.INFO).toBe('info');
    expect(ErrorSeverity.WARNING).toBe('warning');
    expect(ErrorSeverity.ERROR).toBe('error');
    expect(ErrorSeverity.CRITICAL).toBe('critical');
  });
});
