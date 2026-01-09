# Sovereign Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/tests-556%20passing-brightgreen)](https://github.com/TC407-api/sovereign-agent)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Convex](https://img.shields.io/badge/Convex-Real--time-orange?logo=convex&logoColor=white)](https://convex.dev/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

A world-class AI-powered personal assistant for email and calendar management, built with Next.js 15, Convex, and Google Gemini.

> **Built with TDD** - Every feature was developed test-first with 556 tests ensuring reliability.

## Features

### Email Intelligence
- **Smart Draft Generation** - AI-powered email drafts that learn from your communication style
- **Contact Intelligence** - Relationship strength tracking and tone inference from email history
- **Content Guardrails** - PII detection, credential scanning, and tone analysis before sending
- **Priority Triage** - Automatic email prioritization and categorization

### Calendar Intelligence
- **Smart Scheduling** - AI-powered optimal meeting slot finder
- **Conflict Detection** - Automatic detection and alternative suggestions
- **Background Sync** - Real-time calendar synchronization with retry logic
- **Busy Pattern Analysis** - Understand your schedule patterns

### AI Command Interface
- **Natural Language Commands** - "Draft a reply to John" or "Show unread emails from this week"
- **Intent Classification** - Gemini-powered understanding of user intent
- **Command-K Interface** - Quick access to all features via keyboard shortcut

### Safety & Security
- **Rate Limiting** - Token bucket algorithm with sliding window support
- **Content Scanning** - Detect credit cards, SSNs, API keys, passwords
- **Tone Analysis** - Catch aggressive or inappropriate language
- **External Recipient Warnings** - Alert before sending to external domains

### Production Ready
- **556 Tests** - Comprehensive test coverage
- **Error Handling** - Centralized error management with retry logic
- **Real-time Updates** - Powered by Convex subscriptions
- **Dark Theme** - Beautiful dark UI with smooth animations

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Convex (real-time database)
- **AI**: Google Gemini 2.0 Flash
- **Animations**: Framer Motion
- **Testing**: Vitest, React Testing Library
- **Icons**: Lucide React
- **Font**: Geist

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- Google Cloud account (for Gemini API)
- Convex account

### Installation

```bash
# Clone the repository
git clone https://github.com/TC407-api/sovereign-agent.git
cd sovereign-agent

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Start Convex dev server
pnpm convex dev

# Start Next.js dev server
pnpm dev
```

### Environment Variables

```env
CONVEX_DEPLOYMENT=your-deployment
NEXT_PUBLIC_CONVEX_URL=your-convex-url
GOOGLE_API_KEY=your-gemini-api-key
```

## Project Structure

```
sovereign-agent/
├── app/                    # Next.js App Router pages
│   ├── emails/            # Email listing and detail views
│   ├── calendar/          # Calendar view
│   ├── drafts/            # Draft management
│   └── sidecar/           # Meeting prep sidecar
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── streaming/        # Real-time streaming components
├── convex/               # Convex backend
│   ├── emails.ts         # Email mutations/queries
│   ├── drafts.ts         # Draft management
│   ├── calendar.ts       # Calendar events
│   └── ai/               # AI actions
├── lib/                  # Shared utilities
│   ├── ai/              # AI features (command parsing, intent classification)
│   ├── calendar/        # Calendar utilities (sync, scheduling)
│   ├── safety/          # Security features (rate limiting, guardrails)
│   ├── errors/          # Error handling
│   └── types/           # TypeScript type definitions
└── __tests__/           # Test files
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test lib/ai/command-parser.test.ts
```

## Key Components

### AI Command Parser
```typescript
import { parseCommand } from '@/lib/ai/command-parser';

const result = await parseCommand('draft a reply to john@example.com');
// { intent: 'DRAFT_REPLY', entities: { contact: 'john@example.com' }, confidence: 0.95 }
```

### Smart Draft Generator
```typescript
import { generateSmartDraft } from '@/lib/ai/smart-draft-generator';

const draft = await generateSmartDraft({
  originalEmail,
  contactProfile,
  userInstructions: 'Mention I am out next week',
});
```

### Content Guardrails
```typescript
import { analyzeDraftSafety } from '@/lib/safety/content-guardrails';

const analysis = analyzeDraftSafety(draft, 'mycompany.com');
// { overallRisk: 'low', approved: true, contentFlags: [], recommendations: [] }
```

### Rate Limiter
```typescript
import { createRateLimiter } from '@/lib/safety/rate-limiter';

const limiter = createRateLimiter({ maxRequests: 100, windowMs: 60000 });
const result = await limiter.consume('user-123');
// { allowed: true, remaining: 99, resetAt: 1234567890 }
```

## Architecture

### Real-time Data Flow
```
User Action → Convex Mutation → Database Update → Subscription → UI Update
```

### AI Pipeline
```
Natural Language → Command Parser → Intent Classifier → Command Executor → Action
```

### Safety Pipeline
```
Draft Content → PII Scanner → Credential Detector → Tone Analyzer → Approval
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests first (TDD)
4. Implement your feature
5. Ensure all tests pass (`pnpm test`)
6. Commit your changes (`git commit -m 'feat: add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

MIT
