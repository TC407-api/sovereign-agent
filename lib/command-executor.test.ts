import { describe, expect, test, vi, beforeEach } from 'vitest';
import { CommandExecutor } from './command-executor';

// Mock dependencies
const mockArchive = vi.fn();
const mockGenerateDraft = vi.fn();
const mockPush = vi.fn();

describe('CommandExecutor', () => {
  let executor: CommandExecutor;

  beforeEach(() => {
    vi.clearAllMocks();
    executor = new CommandExecutor({
      archiveEmail: mockArchive,
      generateDraft: mockGenerateDraft,
      router: { push: mockPush },
    });
  });

  test('executes archive command', async () => {
    const result = await executor.execute({
      action: 'archive',
      target: 'thread_123',
      context: '',
    });

    expect(mockArchive).toHaveBeenCalledWith({ id: 'thread_123' });
    expect(result.success).toBe(true);
  });

  test('executes navigate command', async () => {
    const result = await executor.execute({
      action: 'navigate',
      target: '/inbox/trash',
      context: '',
    });

    expect(mockPush).toHaveBeenCalledWith('/inbox/trash');
    expect(result.success).toBe(true);
  });

  test('executes find_email with search params', async () => {
    const result = await executor.execute({
      action: 'find_email',
      target: 'amazon',
      context: 'orders',
    });

    expect(mockPush).toHaveBeenCalledWith('/search?from=amazon&q=orders');
    expect(result.success).toBe(true);
  });

  test('executes draft_reply command', async () => {
    const result = await executor.execute({
      action: 'reply',
      target: 't_01',
      context: 'Sounds good.',
    });

    expect(mockGenerateDraft).toHaveBeenCalledWith({
      emailId: 't_01',
      content: 'Sounds good.',
    });
    expect(result.success).toBe(true);
  });

  test('returns error for unknown intent', async () => {
    const result = await executor.execute({
      action: 'unsupported_action',
      target: '',
      context: '',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown');
  });

  test('handles execution errors gracefully', async () => {
    mockArchive.mockRejectedValueOnce(new Error('Database connection failed'));

    const result = await executor.execute({
      action: 'archive',
      target: 'thread_123',
      context: '',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database connection failed');
  });
});
