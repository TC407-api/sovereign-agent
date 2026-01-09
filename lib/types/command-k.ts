export interface CommandSuggestion {
  id: string;
  text: string;
  command: string;
  target?: string;
  icon: string;
  action: () => void;
}

export interface CommandKState {
  isOpen: boolean;
  query: string;
  suggestions: CommandSuggestion[];
  isLoading: boolean;
  selectedIndex: number;
}

export interface CommandResult {
  action: string;
  target: string;
  context: string;
}

const VALID_COMMANDS = ['reply', 'schedule', 'archive', 'send', 'delete', 'forward', 'star'];

const COMMAND_ICONS: Record<string, string> = {
  reply: '\u2709\uFE0F', // envelope
  schedule: '\uD83D\uDCC5', // calendar
  archive: '\uD83D\uDCE5', // archive box
  send: '\uD83D\uDCE9', // outbox
  delete: '\uD83D\uDDD1\uFE0F', // wastebasket
  forward: '\u27A1\uFE0F', // arrow
  star: '\u2B50', // star
};

export function parseCommand(query: string): CommandResult {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return { action: '', target: '', context: '' };
  }

  const words = trimmed.split(/\s+/);
  const action = words[0];

  // Handle "reply to <target> about <context>"
  if (action === 'reply') {
    const toIndex = words.indexOf('to');
    const aboutIndex = words.indexOf('about');

    let target = '';
    let context = '';

    if (toIndex !== -1 && toIndex < words.length - 1) {
      if (aboutIndex !== -1 && aboutIndex > toIndex) {
        target = words.slice(toIndex + 1, aboutIndex).join(' ');
        context = words.slice(aboutIndex).join(' ');
      } else {
        target = words.slice(toIndex + 1).join(' ');
      }
    }

    return { action, target, context };
  }

  // Handle "schedule <event> with <target> <time>"
  if (action === 'schedule') {
    const withIndex = words.indexOf('with');

    let target = '';
    let context = '';

    if (withIndex !== -1 && withIndex < words.length - 1) {
      target = words[withIndex + 1];
      context = [
        ...words.slice(1, withIndex),
        ...words.slice(withIndex + 2),
      ].join(' ');
    } else {
      context = words.slice(1).join(' ');
    }

    return { action, target, context };
  }

  // Handle "archive <context>"
  if (action === 'archive') {
    return {
      action,
      target: '',
      context: words.slice(1).join(' '),
    };
  }

  // Default: first word is action, rest is context
  return {
    action: isValidCommand(action) ? action : 'unknown',
    target: '',
    context: words.slice(1).join(' '),
  };
}

export function isValidCommand(command: string): boolean {
  return VALID_COMMANDS.includes(command.trim().toLowerCase());
}

export function getCommandIcon(command: string): string {
  return COMMAND_ICONS[command.trim().toLowerCase()] || '\u2753'; // question mark
}
