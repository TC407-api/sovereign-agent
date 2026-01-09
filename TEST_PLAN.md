# Feedback Tracker Test Plan - TDD RED Phase

## Test Overview

**Status:** RED PHASE (All tests failing - 26/26 failures)
**Framework:** Vitest
**Location:** `lib/feedback-tracker.test.ts`
**Implementation Stub:** `lib/feedback-tracker.ts`

This test suite follows TDD principles. Tests are designed to FAIL until the actual implementation is complete. No tests should pass until the `feedback-tracker.ts` module functions are implemented.

## Test Summary

| Function | Test Count | Category |
|----------|-----------|----------|
| `trackApproval()` | 5 | Approval tracking |
| `trackRejection()` | 5 | Rejection tracking |
| `calculateAccuracyMetrics()` | 5 | Metrics calculation |
| `extractEditPatterns()` | 9 | Pattern extraction |
| **TOTAL** | **26** | **All failing** |

## Test Results

```
Test Files:  1 failed (1)
Tests:       26 failed (26)
Duration:    ~3.3s
```

## Test Categories Breakdown

### 1. trackApproval (5 tests)

Tests for tracking when users approve AI-generated drafts.

| # | Test Name | Priority | Expected Behavior |
|---|-----------|----------|-------------------|
| 1 | Return approval event object | P0 | Should have eventType, draftId, wasEdited properties |
| 2 | Calculate timeToApproval | P0 | Calculate milliseconds between generation and approval |
| 3 | Flag edited drafts | P1 | Track wasEdited boolean when user makes edits |
| 4 | Include approval timestamp | P0 | Record approvedAt timestamp |
| 5 | Preserve draft metadata | P1 | Keep priority and model info in event |

**Key Assertions:**
- Event has correct structure (`eventType: "approval"`)
- Timestamps calculated accurately
- Metadata preserved from original draft

### 2. trackRejection (5 tests)

Tests for tracking when users reject AI-generated drafts.

| # | Test Name | Priority | Expected Behavior |
|---|-----------|----------|-------------------|
| 1 | Return rejection event object | P0 | Should have eventType, draftId properties |
| 2 | Include rejection reason | P0 | Capture user's reason text |
| 3 | Categorize rejection type | P1 | Classify reason into: tone, content, grammar, other |
| 4 | Include rejection timestamp | P0 | Record rejectedAt timestamp |
| 5 | Preserve draft metadata | P1 | Keep priority and model info in event |

**Key Assertions:**
- Event has correct structure (`eventType: "rejection"`)
- Reason string captured
- Rejection type categorized
- Timestamp recorded

### 3. calculateAccuracyMetrics (5 tests)

Tests for aggregating feedback into accuracy metrics.

| # | Test Name | Priority | Expected Behavior |
|---|-----------|----------|-------------------|
| 1 | Calculate % approved as-is | P0 | Approvals without edits / total events × 100 |
| 2 | Calculate % approved with edits | P0 | Approvals with edits / total events × 100 |
| 3 | Calculate rejection rate | P0 | Rejections / total events × 100 |
| 4 | Group metrics by priority | P1 | Break down accuracy by priority level |
| 5 | Handle edge cases | P1 | Empty array returns 0%, single event correct |

**Expected Metrics Object:**
```typescript
{
  approvedAsIs: number,        // %
  approvedWithEdits: number,   // %
  rejectionRate: number,       // %
  byPriority: {
    urgent: { approvalRate: number, count: number },
    normal: { approvalRate: number, count: number },
    "low-priority": { ... }
  }
}
```

### 4. extractEditPatterns (9 tests)

Tests for analyzing differences between original and edited drafts.

| # | Test Name | Priority | Expected Behavior |
|---|-----------|----------|-------------------|
| 1 | Detect word count increase | P0 | Calculate positive wordCountChange |
| 2 | Detect word count decrease | P0 | Calculate negative wordCountChange |
| 3 | Detect formality increase | P1 | Identify shift toward formal tone |
| 4 | Detect casualness increase | P1 | Identify shift toward casual tone |
| 5 | Detect no tone change | P1 | Return "neutral" when no obvious shift |
| 6 | Return diff summary | P0 | Text summary of key changes |
| 7 | Calculate similarity score | P0 | 0-100 score of text similarity |
| 8 | 100% similarity for identical | P1 | Identical texts = 100 |
| 9 | Low similarity for different | P1 | Completely different = <50 |

**Expected Edit Patterns Object:**
```typescript
{
  wordCountChange: number,           // +/- word difference
  toneChange: "more_formal" | "more_casual" | "neutral",
  diffSummary: string,               // Human-readable summary
  similarityScore: number            // 0-100
}
```

## Formal Keywords by Tone Category

**Formal Keywords (detect more_formal):**
- "formally", "pursuant", "acknowledge", "request", "assist", "matter"

**Casual Keywords (detect more_casual):**
- "hey", "thanks", "cool", "stuff", "thing", "just", "gonna", "wanna"

## Test Data Patterns

### Draft Objects (across all tests)
```typescript
{
  id: string,              // "draft-001", "draft-002", etc.
  content: string,         // Email/response text
  generatedAt: Date,       // Timestamp of generation
  priority: "urgent" | "normal" | "low-priority",
  model: "gpt-4" | "gpt-4-turbo"
}
```

### Event Objects (trackApproval)
```typescript
{
  eventType: "approval",
  draftId: string,
  wasEdited: boolean,
  timeToApproval: number,  // milliseconds
  approvedAt: Date,
  priority: string,
  model: string
}
```

### Event Objects (trackRejection)
```typescript
{
  eventType: "rejection",
  draftId: string,
  reason: string,
  rejectionType: "tone" | "content" | "grammar" | "other",
  rejectedAt: Date,
  priority: string,
  model: string
}
```

## Next Steps (GREEN Phase)

To implement and pass these tests:

1. **Implement `trackApproval()`**
   - Create ApprovalEvent with current timestamp
   - Calculate timeToApproval from generatedAt
   - Copy priority and model from draft

2. **Implement `trackRejection()`**
   - Create RejectionEvent with current timestamp
   - Analyze reason string to categorize rejectionType
   - Copy priority and model from draft

3. **Implement `calculateAccuracyMetrics()`**
   - Filter events by type (approval vs rejection)
   - Calculate percentages
   - Group by priority level
   - Handle empty arrays

4. **Implement `extractEditPatterns()`**
   - Calculate word count difference
   - Detect tone shift (analyze formal/casual keywords)
   - Generate diff summary
   - Calculate similarity score (Levenshtein or simple comparison)

## Test Execution

```bash
# Run all feedback tracker tests
npm test -- lib/feedback-tracker.test.ts

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## Code Quality Requirements

All functions must follow the codebase standards:
- **Max length:** 30 lines per function
- **Max parameters:** 4 (use options object if needed)
- **Max nesting:** 3 levels deep
- **Test coverage:** 80% minimum

## Key Design Principles

1. **Pure Functions** - No side effects, deterministic outputs
2. **Typed Events** - Use discriminated unions for ApprovalEvent vs RejectionEvent
3. **Timezone Aware** - Handle Date objects correctly across timezones
4. **Percentile Precision** - Round percentages to 2 decimal places
5. **Similarity Metrics** - Use consistent algorithm for text comparison

## Notes

- All tests use real `Date` objects to ensure timestamp accuracy
- Edit pattern detection should be case-insensitive for keyword matching
- Rejection type categorization should be extensible for future types
- Metrics should handle edge cases gracefully (0 events, all same type, etc.)
