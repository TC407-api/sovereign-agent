import { describe, test, expect } from 'vitest';
import type {
  CommandKState,
  CommandSuggestion,
  CommandResult,
} from './command-k';
import { parseCommand, isValidCommand, getCommandIcon } from './command-k';

describe('CommandK Types', () => {
  test('CommandKState has correct structure', () => {
    const state: CommandKState = {
      isOpen: true,
      query: 'reply to',
      suggestions: [],
      isLoading: false,
      selectedIndex: 0,
    };
    expect(state.isOpen).toBe(true);
    expect(state.query).toBe('reply to');
  });

  test('parseCommand extracts action and target', () => {
    const result = parseCommand('reply to john about meeting');
    expect(result.action).toBe('reply');
    expect(result.target).toBe('john');
    expect(result.context).toBe('about meeting');
  });

  test('parseCommand handles schedule commands', () => {
    const result = parseCommand('schedule meeting with team tomorrow');
    expect(result.action).toBe('schedule');
    expect(result.target).toBe('team');
  });

  test('isValidCommand validates known commands', () => {
    expect(isValidCommand('reply')).toBe(true);
    expect(isValidCommand('schedule')).toBe(true);
    expect(isValidCommand('archive')).toBe(true);
    expect(isValidCommand('unknown')).toBe(false);
  });

  test('getCommandIcon returns appropriate icons', () => {
    expect(getCommandIcon('reply')).toBe('\u2709\uFE0F');
    expect(getCommandIcon('schedule')).toBe('\uD83D\uDCC5');
    expect(getCommandIcon('archive')).toBe('\uD83D\uDCE5');
  });
});
