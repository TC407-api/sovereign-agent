# Feedback Tracker Test Suite - TDD RED Phase

Complete test suite for AI draft feedback tracking system. All 26 tests designed to FAIL until implementation is complete.

## Quick Start

```bash
# Run tests
npm test -- lib/feedback-tracker.test.ts

# Run in watch mode
npm test -- --watch lib/feedback-tracker.test.ts

# View in UI
npm run test:ui
```

## Files Created

| File | Purpose | Size |
|------|---------|------|
| `lib/feedback-tracker.test.ts` | Complete test suite | 516 lines, 26 tests |
| `lib/feedback-tracker.ts` | Type stubs + functions | 119 lines, 4 functions |
| `TEST_PLAN.md` | Detailed test strategy | Full documentation |
| `FEEDBACK_TRACKER_DELIVERY.md` | Delivery summary | Status + breakdown |
| `README_TESTS.md` | This file | Quick reference |

## Test Status

```
Current Status: RED PHASE (All tests failing)
Tests: 26 failed / 26 total
Duration: ~3.3 seconds
Expected: All failures until implementation complete
```

## Test Organization

### 1. trackApproval() - 5 Tests
Tracking user approvals on AI-generated drafts

**Test Names:**
- should return an approval event object with correct structure
- should calculate timeToApproval in milliseconds
- should flag when draft was edited before approval
- should include timestamp of approval
- should preserve draft metadata in approval event

**Expected Return:**
```typescript
{
  eventType: "approval",
  draftId: "draft-001",
  wasEdited: false,
  timeToApproval: 300000,        // milliseconds
  approvedAt: Date,
  priority: "normal",
  model: "gpt-4"
}
```

### 2. trackRejection() - 5 Tests
Tracking user rejections on AI-generated drafts

**Test Names:**
- should return a rejection event object with correct structure
- should include rejection reason in event
- should categorize rejection type based on reason
- should include timestamp of rejection
- should preserve draft metadata in rejection event

**Expected Return:**
```typescript
{
  eventType: "rejection",
  draftId: "draft-002",
  reason: "Tone too formal",
  rejectionType: "tone",        // | "content" | "grammar" | "other"
  rejectedAt: Date,
  priority: "urgent",
  model: "gpt-4"
}
```

### 3. calculateAccuracyMetrics() - 5 Tests
Aggregating feedback into system accuracy metrics

**Test Names:**
- should calculate percentage of approvals as-is (without edits)
- should calculate percentage of approvals with edits
- should calculate percentage of rejections
- should group metrics by priority level
- should return zero percentages for empty events array

**Expected Return:**
```typescript
{
  approvedAsIs: 66.67,
  approvedWithEdits: 33.33,
  rejectionRate: 0,
  byPriority: {
    urgent: { approvalRate: 100, count: 5 },
    normal: { approvalRate: 50, count: 10 }
  }
}
```

### 4. extractEditPatterns() - 9 Tests
Analyzing differences between original and edited drafts

**Test Names:**
- should detect word count changes between original and edited text
- should detect when edited version is shorter
- should detect tone changes toward formality
- should detect tone changes toward casualness
- should return neutral tone when no obvious change
- should return a diff summary showing key changes
- should detect if content was completely rewritten
- should detect punctuation and capitalization changes
- should return similarity score of 100 for identical texts

**Expected Return:**
```typescript
{
  wordCountChange: 25,                    // positive=longer, negative=shorter
  toneChange: "more_formal",              // | "more_casual" | "neutral"
  diffSummary: "Added formal greetings, expanded explanation",
  similarityScore: 85                     // 0-100
}
```

## Implementation Hints

### For trackApproval()
- Calculate timeToApproval as `Date.now() - draft.generatedAt.getTime()`
- Include all draft metadata (priority, model)
- Preserve the wasEdited flag passed as parameter

### For trackRejection()
- Analyze reason string to categorize type:
  - Contains "tone" → "tone"
  - Contains "content" → "content"
  - Contains "spell", "grammar", "punctuation" → "grammar"
  - Otherwise → "other"
- Include all draft metadata

### For calculateAccuracyMetrics()
- Filter events by eventType to separate approvals vs rejections
- Count approvals with wasEdited=true vs false
- Calculate percentages as `(count / total) * 100`
- Group by priority field in events
- Handle edge case: empty array should return all zeros

### For extractEditPatterns()
- Word count: `edited.split(/\s+/).length - original.split(/\s+/).length`
- Tone detection: scan for formal vs casual keywords
- Similarity score: use string similarity algorithm (Levenshtein)
- Diff summary: describe what changed (added, removed, modified)

## Test Data Examples

### Draft Object
```typescript
{
  id: "draft-001",
  content: "Please review this proposal when you have a moment.",
  generatedAt: new Date("2025-01-09T10:00:00Z"),
  priority: "normal",
  model: "gpt-4"
}
```

### Sample Event Sequences
```typescript
// User approves without editing
const approval = trackApproval(draft, false)
// Returns: { eventType: "approval", wasEdited: false, ... }

// User edits then approves
const editedApproval = trackApproval(draft, true)
// Returns: { eventType: "approval", wasEdited: true, ... }

// User rejects with reason
const rejection = trackRejection(draft, "Too informal")
// Returns: { eventType: "rejection", rejectionType: "tone", ... }

// Extract patterns from edit
const patterns = extractEditPatterns(
  "Hey there, check this out",
  "I would like to respectfully request your review"
)
// Returns: { wordCountChange: 10, toneChange: "more_formal", ... }
```

## Key Design Principles

1. **Pure Functions** - No side effects, no external dependencies
2. **Immutable** - Don't modify input parameters
3. **Typed** - Full TypeScript type safety
4. **Deterministic** - Same input always produces same output
5. **Timezone-Aware** - Handle Date objects correctly
6. **Extensible** - Easy to add new rejection types or metrics

## Code Quality Standards

- Max 30 lines per function
- Max 4 parameters per function
- Max 3 nesting levels
- 80% minimum test coverage
- No side effects in functions
- Proper error handling

## Running Specific Tests

```bash
# Run single test function
npm test -- -t "trackApproval"

# Run single describe block
npm test -- -t "calculateAccuracyMetrics"

# Run tests matching pattern
npm test -- -t "word count"

# Run with coverage
npm run test:coverage
```

## Next: GREEN Phase

Implement the functions to pass all 26 tests. Expected coverage: 80%+

After implementation should see:
```
Test Files: 1 passed (1)
Tests: 26 passed (26)
```

## Integration Example

After implementation, these functions work together:

```typescript
// User receives draft
const draft = await generateDraft(prompt);

// User approves with edits
const approved = trackApproval(draft, true);

// Extract patterns from edit
const patterns = extractEditPatterns(draft.content, userEdited);

// Calculate metrics
const events = [approved];
const metrics = calculateAccuracyMetrics(events);
// {approvedAsIs: 0, approvedWithEdits: 100, ...}
```

## File Locations

```
sovereign-agent/
├── lib/
│   ├── feedback-tracker.test.ts    (516 lines, 26 tests)
│   └── feedback-tracker.ts         (119 lines, stubs)
├── TEST_PLAN.md                    (Detailed strategy)
├── FEEDBACK_TRACKER_DELIVERY.md    (Status summary)
└── README_TESTS.md                 (This file)
```

## Questions?

See:
- `TEST_PLAN.md` - Full requirements and testing strategy
- `lib/feedback-tracker.test.ts` - Complete test code
- `lib/feedback-tracker.ts` - Type definitions
