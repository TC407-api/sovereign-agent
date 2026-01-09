'use client';

import { Component, ReactNode } from 'react';

interface StreamingBoundaryProps {
  name: string;
  children: ReactNode;
  isLoading?: boolean;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
  onRetry?: () => void;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<
  {
    children: ReactNode;
    name: string;
    onError?: (e: Error) => void;
    onRetry?: () => void;
  },
  ErrorState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-red-200 bg-red-50">
          <svg
            className="h-8 w-8 text-red-500 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm text-red-600 mb-2">
            Error loading {this.props.name}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function DefaultSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-20 bg-gray-200 rounded w-full" />
    </div>
  );
}

export function StreamingBoundary({
  name,
  children,
  isLoading = false,
  fallback,
  onError,
  onRetry,
}: StreamingBoundaryProps) {
  if (isLoading) {
    return <>{fallback || <DefaultSkeleton />}</>;
  }

  return (
    <ErrorBoundary name={name} onError={onError} onRetry={onRetry}>
      {children}
    </ErrorBoundary>
  );
}
