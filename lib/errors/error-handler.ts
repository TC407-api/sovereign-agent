/**
 * Error Handler - Centralized error management
 *
 * Provides structured errors, retry logic, and user-friendly
 * error messages for production-ready error handling.
 */

/**
 * Common error codes for the application
 */
export const ErrorCode = {
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Authentication errors
  AUTH_ERROR: 'AUTH_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_FAILED: 'CONNECTION_FAILED',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // AI-specific errors
  AI_ERROR: 'AI_ERROR',
  CONTEXT_TOO_LONG: 'CONTEXT_TOO_LONG',
  CONTENT_FILTERED: 'CONTENT_FILTERED',

  // External service errors
  GMAIL_ERROR: 'GMAIL_ERROR',
  CALENDAR_ERROR: 'CALENDAR_ERROR',
  CONVEX_ERROR: 'CONVEX_ERROR',

  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const;

export type ErrorSeverityType = (typeof ErrorSeverity)[keyof typeof ErrorSeverity];

/**
 * Application error options
 */
export interface AppErrorOptions {
  code: string;
  message: string;
  severity?: ErrorSeverityType;
  retryable?: boolean;
  context?: Record<string, unknown>;
  cause?: Error;
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverityType;
  public readonly retryable: boolean;
  public readonly context?: Record<string, unknown>;
  public readonly cause?: Error;
  public readonly timestamp: number;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.severity = options.severity || ErrorSeverity.ERROR;
    this.retryable = options.retryable ?? false;
    this.context = options.context;
    this.cause = options.cause;
    this.timestamp = Date.now();

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
      retryable: this.retryable,
      context: this.context,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Create an AppError from various inputs
 */
export function createAppError(
  input: AppErrorOptions | Error | unknown
): AppError {
  if (input instanceof AppError) {
    return input;
  }

  if (input instanceof Error) {
    return new AppError({
      code: ErrorCode.UNKNOWN_ERROR,
      message: input.message,
      cause: input,
    });
  }

  if (typeof input === 'object' && input !== null && 'code' in input && 'message' in input) {
    return new AppError(input as AppErrorOptions);
  }

  return new AppError({
    code: ErrorCode.UNKNOWN_ERROR,
    message: String(input),
  });
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Error handling result
 */
export interface ErrorHandlingResult {
  errorId: string;
  userMessage: string;
  shouldReport: boolean;
}

/**
 * Generate a unique error ID
 */
function generateErrorId(): string {
  return `err_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Get user-friendly message based on severity
 */
function getUserMessage(error: AppError): string {
  switch (error.severity) {
    case ErrorSeverity.INFO:
      return 'An issue occurred but your request was processed.';
    case ErrorSeverity.WARNING:
      return 'Something went wrong. Please try again.';
    case ErrorSeverity.ERROR:
      return 'We encountered an error. Please try again later.';
    case ErrorSeverity.CRITICAL:
      return 'A critical error occurred. Our team has been notified.';
    default:
      return 'An unexpected error occurred.';
  }
}

/**
 * Handle an error - log it and return user-friendly information
 */
export function handleError(error: unknown): ErrorHandlingResult {
  const appError = createAppError(error);
  const errorId = generateErrorId();

  // Log the error (in production, this would go to a logging service)
  console.error(`[${errorId}]`, {
    code: appError.code,
    message: appError.message,
    severity: appError.severity,
    context: appError.context,
    stack: appError.stack,
  });

  return {
    errorId,
    userMessage: getUserMessage(appError),
    shouldReport: appError.severity === ErrorSeverity.CRITICAL,
  };
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum number of attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelayMs?: number;
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelayMs?: number;
  /** Callback on retry */
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_RETRY_CONFIG: Required<Omit<RetryConfig, 'onRetry'>> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 30000,
};

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const mergedConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= mergedConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      if (isAppError(error) && !error.retryable) {
        throw error;
      }

      // Check if we've exhausted attempts
      if (attempt >= mergedConfig.maxAttempts) {
        throw lastError;
      }

      // Call onRetry callback
      config.onRetry?.(attempt, lastError);

      // Calculate delay with exponential backoff
      const delay = Math.min(
        mergedConfig.initialDelayMs * Math.pow(mergedConfig.backoffMultiplier, attempt - 1),
        mergedConfig.maxDelayMs
      );

      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error('Retry failed');
}

/**
 * Create a retryable version of a function
 */
export function makeRetryable<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  config: RetryConfig = {}
): T {
  return ((...args: unknown[]) => withRetry(() => fn(...args), config)) as T;
}

/**
 * Error boundary helper for React
 */
export interface ErrorBoundaryInfo {
  componentStack: string;
}

export function logErrorBoundary(
  error: Error,
  info: ErrorBoundaryInfo
): ErrorHandlingResult {
  const appError = createAppError({
    code: ErrorCode.INTERNAL_ERROR,
    message: error.message,
    severity: ErrorSeverity.CRITICAL,
    context: {
      componentStack: info.componentStack,
    },
    cause: error,
  });

  return handleError(appError);
}
