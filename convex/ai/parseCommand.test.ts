import { describe, expect, test } from 'vitest';
import { parseCommand } from './parseCommand';

describe('parseCommand action', () => {
  test('parses schedule meeting command', async () => {
    const result = await parseCommand('Schedule a meeting with Alice at 3pm tomorrow');

    expect(result.intent).toBe('schedule_meeting');
    expect(result.entities.person?.toLowerCase()).toBe('alice');
    expect(result.entities.time).toBe('3pm');
    expect(result.entities.date).toBe('tomorrow');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  test('parses find email command', async () => {
    const result = await parseCommand('Find emails from Bob about the project');

    expect(result.intent).toBe('find_email');
    expect(result.entities.person?.toLowerCase()).toBe('bob');
  });

  test('parses archive command', async () => {
    const result = await parseCommand('Archive this conversation');

    expect(result.intent).toBe('archive');
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  test('handles ambiguous commands gracefully', async () => {
    const result = await parseCommand('random gibberish input');

    expect(result.intent).toBe('unknown');
    expect(result.confidence).toBeLessThan(0.5);
  });

  test('returns structured parsed result', async () => {
    const result = await parseCommand('test input');

    expect(result).toHaveProperty('intent');
    expect(result).toHaveProperty('entities');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('rawInput', 'test input');
    expect(typeof result.intent).toBe('string');
    expect(typeof result.entities).toBe('object');
    expect(typeof result.confidence).toBe('number');
  });
});
