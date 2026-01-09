# TDD Tasks - Sovereign Agent

## Phase 1: Infrastructure ✅
- [x] Project setup
- [x] Convex backend configuration
- [x] Basic schema
- [x] 24 tests passing

## Phase 2: Shadow Processing ✅
- [x] Email classifier (OpenAI GPT-4o-mini)
- [x] Draft generator (OpenAI GPT-4o-mini)
- [x] Convex schema with priority fields + drafts table
- [x] Gmail sync integration
- [x] 83 tests passing, 31 skipped

## Phase 3: Email Sync & Storage ✅
- [x] Gmail API integration
- [x] Calendar sync
- [x] Email storage in Convex
- [x] Deployed to production

## Phase 4: User Approval Workflow ✅

### Goal
Enable users to review, edit, and approve AI-generated email drafts before sending.

### Features to Implement (TDD Style)

#### 4.1: Draft Review UI ✅
- [x] Display list of pending drafts (PendingDraftsList.tsx)
- [x] Show original email context alongside draft (DraftReview.tsx)
- [x] Highlight AI-suggested priority level (DraftReview.tsx)
- [x] Show confidence scores (DraftReview.tsx)

#### 4.2: Draft Editing ✅
- [x] Inline editor for draft modification (DraftReview.tsx)
- [x] Save edited drafts (drafts.ts updateDraft mutation)
- [x] Track edit history (editCount in schema)
- [x] Preserve original AI draft for learning (originalContent in schema)

#### 4.3: Approval Actions ✅
- [x] Approve draft (mark ready to send)
- [x] Reject draft (delete or archive)
- [x] Request regeneration with feedback (draftRegeneration.ts)
- [ ] Schedule send time (partial - schema supports it)

#### 4.4: Feedback Loop ✅
- [x] Capture user edits as training data (feedback-tracker.ts)
- [x] Store approval/rejection reasons (schema)
- [x] Calculate accuracy metrics (feedback-tracker.ts)
- [x] Log common edit patterns (feedback-tracker.ts)

#### 4.5: Backend Mutations ✅
- [x] `approveDraft` - Mark draft approved
- [x] `rejectDraft` - Mark draft rejected
- [x] `updateDraft` - Save user edits
- [x] `regenerateDraft` - Create new version with feedback
- [ ] `scheduleDraft` - Set send time (partial)

#### 4.6: Real-time Updates ✅
- [x] Subscribe to draft changes (usePendingDrafts hook)
- [x] Show approval status in real-time (DraftsPage.tsx)
- [ ] Notify on draft ready to review (future enhancement)
- [ ] Show edit conflicts if applicable (future enhancement)

### TDD Test Plan for Phase 4

Each feature follows RED-GREEN-REFACTOR:

1. **Write failing test** for behavior
2. **Implement minimum code** to pass
3. **Refactor** while keeping tests green

### Test Files for Phase 4
- `convex/drafts.test.ts` - Draft mutation tests
- `components/DraftReview.test.tsx` - UI component tests
- `__tests__/approval-workflow.integration.test.ts` - E2E tests
- `lib/feedback-tracker.test.ts` - Learning system tests

---

## Phase 5: Calendar Intelligence ⏳

### Goal
Leverage Google Calendar data for meeting prep and conflict detection.

### Features to Implement (TDD Style)

#### 5.1: Calendar Sync
- [x] Google Calendar API integration (calendarService.ts)
- [x] Event storage in Convex (events table)
- [x] Sync action with incremental updates (syncCalendar action)
- [ ] Background auto-sync (scheduled function)
- [ ] Multi-calendar support

#### 5.2: Event Display
- [x] Calendar week view component (CalendarWeekView.tsx)
- [x] Event list query (listEvents)
- [ ] Day/month view options
- [ ] Event detail modal
- [ ] Quick event creation

#### 5.3: Conflict Detection
- [x] ConflictDetector component (ConflictDetector.tsx)
- [ ] Overlap detection algorithm
- [ ] Email mention → calendar cross-reference
- [ ] Suggested times for rescheduling
- [ ] Alert on double-booking

#### 5.4: Meeting Prep Cards
- [x] PrepCard component (PrepCard.tsx)
- [x] StreamingPrepCard with loading states
- [ ] Auto-generate prep from attendee emails
- [ ] Recent conversation summary
- [ ] Action items from past meetings

### Test Files for Phase 5
- `convex/calendar.test.ts` - Calendar query/mutation tests
- `lib/calendarService.test.ts` - Google Calendar API tests
- `components/CalendarWeekView.test.tsx` - Calendar UI tests
- `lib/conflict-detector.test.ts` - Conflict detection logic tests

---

## Phase 6: Contact Intelligence ⏳

### Goal
Build rich contact profiles from email history for better AI context.

### Features to Implement (TDD Style)

#### 6.1: Contact Extraction
- [x] Contact schema (contacts table)
- [x] Upsert contact mutation
- [ ] Extract contacts from email headers
- [ ] Deduplicate by email/name variations
- [ ] Company/role inference from signature

#### 6.2: Contact Enrichment
- [x] Basic contact fields (email, name, company, role)
- [ ] Interaction frequency tracking
- [ ] Common topics extraction
- [ ] Sentiment analysis on threads
- [ ] Response time patterns

#### 6.3: Sidecar Panel
- [x] SidecarPanel component
- [x] SidecarPage with contact context
- [ ] Real-time contact lookup on email open
- [ ] Conversation history timeline
- [ ] Quick action buttons (schedule, draft, etc.)

#### 6.4: AI Context Injection
- [ ] Include contact context in draft generation
- [ ] Personalize tone based on relationship
- [ ] Reference past conversations
- [ ] Suggest follow-ups based on history

### Test Files for Phase 6
- `convex/contacts.test.ts` - Contact mutation tests
- `lib/contact-extractor.test.ts` - Extraction logic tests
- `components/SidecarPanel.test.tsx` - Sidecar UI tests

---

## Phase 7: Safety & Guardrails ⏳

### Goal
Implement human-in-the-loop controls and audit trails for AI actions.

### Features to Implement (TDD Style)

#### 7.1: Audit Trail
- [x] AuditTrail component
- [x] SafetyDashboard component
- [ ] Log all AI decisions with reasoning
- [ ] Track approval/rejection history
- [ ] Export audit logs

#### 7.2: Rate Limiting
- [ ] Daily send limits
- [ ] Per-contact frequency limits
- [ ] Cooldown periods
- [ ] Override mechanism for urgent emails

#### 7.3: Content Guardrails
- [ ] Sensitive content detection
- [ ] PII redaction warnings
- [ ] Tone analysis (too aggressive, too casual)
- [ ] External recipient warnings

#### 7.4: Approval Workflows
- [x] Single-approval flow (approveDraft)
- [ ] Multi-step approval for high-stakes emails
- [ ] Delegate approval to others
- [ ] Auto-approve for trusted contacts
- [ ] Escalation rules

### Test Files for Phase 7
- `lib/safety-rules.test.ts` - Guardrail logic tests
- `convex/audit.test.ts` - Audit logging tests
- `components/SafetyDashboard.test.tsx` - Safety UI tests

---

## Phase 8: AI Command Interface ⏳

### Goal
Natural language interface for email management and AI assistance.

### Features to Implement (TDD Style)

#### 8.1: Command Palette
- [x] CommandK component (Cmd+K trigger)
- [x] AI Command button on dashboard
- [ ] Natural language parsing
- [ ] Intent classification
- [ ] Command history

#### 8.2: Email Commands
- [ ] "Draft a reply to [email]"
- [ ] "Summarize my inbox"
- [ ] "Show urgent emails"
- [ ] "Find emails from [contact]"
- [ ] "Schedule follow-up for [email]"

#### 8.3: Calendar Commands
- [ ] "What's on my calendar today?"
- [ ] "Schedule meeting with [contact]"
- [ ] "Find free time this week"
- [ ] "Reschedule [event]"

#### 8.4: Batch Operations
- [ ] "Archive all newsletters"
- [ ] "Mark all from [sender] as read"
- [ ] "Generate drafts for all urgent emails"
- [ ] "Snooze emails until Monday"

### Test Files for Phase 8
- `lib/command-parser.test.ts` - NLP parsing tests
- `lib/intent-classifier.test.ts` - Intent classification tests
- `components/CommandK.test.tsx` - Command UI tests

---

## Phase 9: Frontend Polish & UX ⏳

### Goal
Professional, delightful UI with smooth animations and consistent design.

### Features to Implement (TDD Style)

#### 9.1: Design System
- [ ] Color tokens & dark theme
- [ ] Typography scale
- [ ] Spacing system
- [ ] Component variants (Button, Card, Input, etc.)
- [ ] Icon library integration (Lucide)

#### 9.2: Animations & Transitions
- [ ] Page transitions (Framer Motion)
- [ ] List animations (stagger, reorder)
- [ ] Loading skeletons
- [ ] Micro-interactions (hover, click feedback)
- [ ] Toast notifications

#### 9.3: Email Rendering
- [x] HTML email sanitization (DOMPurify)
- [x] Prose styling (@tailwindcss/typography)
- [x] Plain text formatting
- [ ] Attachment previews
- [ ] Inline image display
- [ ] Thread collapse/expand

#### 9.4: Responsive Design
- [ ] Mobile-first layouts
- [ ] Touch-friendly interactions
- [ ] Swipe gestures for actions
- [ ] Adaptive navigation

#### 9.5: Real-time Features
- [x] Live query updates (Convex useQuery)
- [ ] Optimistic updates on mutations
- [ ] Connection status indicator
- [ ] Offline support (service worker)
- [ ] Push notifications

### Test Files for Phase 9
- `components/ui/*.test.tsx` - Base component tests
- `__tests__/accessibility.test.ts` - A11y audit tests
- `__tests__/responsive.test.ts` - Viewport tests

---

## Phase 10: Production Readiness ⏳

### Goal
Ship a reliable, performant, secure application.

### Features to Implement

#### 10.1: Performance
- [ ] Bundle size optimization
- [ ] Image optimization (Next.js Image)
- [ ] Lazy loading for heavy components
- [ ] Query pagination
- [ ] Caching strategy

#### 10.2: Error Handling
- [x] StreamingBoundary error boundary
- [ ] Global error boundary
- [ ] Sentry integration
- [ ] User-friendly error messages
- [ ] Retry mechanisms

#### 10.3: Security
- [x] NextAuth session management
- [x] OAuth token handling
- [ ] CSRF protection
- [ ] Rate limiting on API routes
- [ ] Input sanitization

#### 10.4: Deployment
- [x] Convex production deployment
- [ ] Vercel deployment
- [ ] Environment variables management
- [ ] CI/CD pipeline
- [ ] Monitoring & alerting

### Test Files for Phase 10
- `__tests__/performance.test.ts` - Load time tests
- `__tests__/security.test.ts` - Security audit tests
- `__tests__/e2e/*.test.ts` - End-to-end tests

---

## Test Summary

| Phase | Tests Written | Tests Passing | Coverage |
|-------|---------------|---------------|----------|
| 1. Infrastructure | 24 | 24 | ✅ |
| 2. Shadow Processing | 83 | 83 | ✅ |
| 3. Email Sync | ~50 | ~50 | ✅ |
| 4. Approval Workflow | ~100 | ~100 | ✅ |
| 5. Calendar Intelligence | TBD | TBD | ⏳ |
| 6. Contact Intelligence | TBD | TBD | ⏳ |
| 7. Safety & Guardrails | TBD | TBD | ⏳ |
| 8. AI Command Interface | TBD | TBD | ⏳ |
| 9. Frontend Polish | TBD | TBD | ⏳ |
| 10. Production Readiness | TBD | TBD | ⏳ |

**Current Status**: 401 tests passing, 64 test files, 42 skipped

---

## Quick Start for Each Phase

```bash
# Run all tests
pnpm test

# Run specific phase tests
pnpm test convex/drafts.test.ts      # Phase 4
pnpm test convex/calendar.test.ts    # Phase 5
pnpm test lib/safety-rules.test.ts   # Phase 7

# Watch mode during development
pnpm test --watch

# Coverage report
pnpm test --coverage
```

---

## TDD Workflow Reminder

For each feature:

1. **RED**: Write a failing test that describes the behavior
2. **GREEN**: Write the minimum code to make it pass
3. **REFACTOR**: Clean up while keeping tests green

```typescript
// Example TDD cycle
describe('Draft regeneration', () => {
  it('should create new version with user feedback', async () => {
    // RED: This test fails because regenerateDraft doesn't exist
    const result = await regenerateDraft({
      draftId: 'draft123',
      userFeedback: 'Make it more formal'
    });
    expect(result.version).toBe(2);
  });
});
```
