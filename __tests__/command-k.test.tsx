import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import { CommandK } from '@/components/CommandK';

// Mock the AI modules
vi.mock('@/lib/ai/command-parser', () => ({
  parseCommand: vi.fn().mockResolvedValue({
    intent: 'DRAFT_REPLY',
    entities: {},
    confidence: 0.9,
    rawCommand: 'draft a reply',
    suggestions: [],
  }),
  getCommandExamples: vi.fn().mockReturnValue([
    { command: 'Draft a reply', description: 'Create an AI-generated reply' },
    { command: 'Summarize my inbox', description: 'Get a summary of unread emails' },
  ]),
}));

vi.mock('@/lib/ai/intent-classifier', () => ({
  classifyIntent: vi.fn().mockResolvedValue({
    intent: 'DRAFT_REPLY',
    entities: {},
    confidence: 0.9,
    rawCommand: 'draft a reply',
    usedAI: false,
  }),
  executeIntent: vi.fn().mockResolvedValue({
    action: 'DRAFT_REPLY',
    params: {},
    description: 'Draft a reply',
    requiresConfirmation: false,
  }),
}));

describe('CommandK Component', () => {
  test('renders closed by default', () => {
    render(<CommandK isOpen={false} onClose={() => {}} onExecute={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('renders modal when open', () => {
    render(<CommandK isOpen={true} onClose={() => {}} onExecute={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('displays search input', () => {
    render(<CommandK isOpen={true} onClose={() => {}} onExecute={() => {}} />);
    expect(screen.getByPlaceholderText(/ask me anything/i)).toBeInTheDocument();
  });

  test('calls onClose when escape is pressed', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CommandK isOpen={true} onClose={onClose} onExecute={() => {}} />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  test('shows suggestions based on input', async () => {
    const user = userEvent.setup();
    render(<CommandK isOpen={true} onClose={() => {}} onExecute={() => {}} />);
    const input = screen.getByPlaceholderText(/ask me anything/i);
    await user.type(input, 'reply');
    expect(screen.getByText(/draft a reply/i)).toBeInTheDocument();
  });
});
