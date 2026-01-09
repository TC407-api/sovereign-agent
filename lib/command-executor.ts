interface ExecutorDependencies {
  archiveEmail: (args: { id: string }) => Promise<void>;
  generateDraft: (args: { emailId: string; content?: string }) => Promise<void>;
  router: { push: (path: string) => void };
}

interface ExecuteInput {
  action: string;
  target: string;
  context: string;
}

interface ExecuteResult {
  success: boolean;
  error?: string;
}

export class CommandExecutor {
  private deps: ExecutorDependencies;

  constructor(deps: ExecutorDependencies) {
    this.deps = deps;
  }

  async execute(input: ExecuteInput): Promise<ExecuteResult> {
    try {
      switch (input.action) {
        case 'archive':
          await this.deps.archiveEmail({ id: input.target });
          return { success: true };
        case 'navigate':
          this.deps.router.push(input.target);
          return { success: true };
        case 'find_email':
          this.deps.router.push(`/search?from=${input.target}&q=${input.context}`);
          return { success: true };
        case 'reply':
          await this.deps.generateDraft({ emailId: input.target, content: input.context });
          return { success: true };
        default:
          return { success: false, error: 'Unknown action' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
