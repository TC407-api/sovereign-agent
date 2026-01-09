export type StreamingStatus = 'pending' | 'streaming' | 'complete' | 'error';

export interface StreamingState {
  status: StreamingStatus;
  progress: number; // 0-1
  chunksReceived: number;
  error: Error | null;
}

export interface StreamChunk<T = unknown> {
  id: string;
  component: string;
  data: T;
  isComplete: boolean;
  timestamp: number;
}

export interface StreamingComponent<T = unknown> {
  name: string;
  status: StreamingStatus;
  data: T | null;
  error: Error | null;
  startTime: number;
  endTime?: number;
}

export interface StreamProgress {
  total: number;
  completed: number;
  failed: number;
  components: Record<string, StreamingStatus>;
}

// Type guards
export function isStreamChunk<T>(obj: unknown): obj is StreamChunk<T> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as any).id === 'string' &&
    'component' in obj &&
    typeof (obj as any).component === 'string' &&
    'data' in obj &&
    'isComplete' in obj &&
    typeof (obj as any).isComplete === 'boolean' &&
    'timestamp' in obj &&
    typeof (obj as any).timestamp === 'number'
  );
}

export function isComplete(state: StreamingState): boolean {
  return state.status === 'complete';
}

export function hasError(state: StreamingState): boolean {
  return state.status === 'error' || state.error !== null;
}

// Stream event types for SSE
export type StreamEvent =
  | { type: 'chunk'; payload: StreamChunk }
  | { type: 'progress'; payload: StreamProgress }
  | { type: 'error'; payload: { message: string; component?: string } }
  | { type: 'complete'; payload: { duration: number } };
