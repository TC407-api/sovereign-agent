# DraftReview Component - Quick Start

## RED Phase Status: ✅ COMPLETE

56 failing tests ready for implementation.

## Files

| File | Purpose |
|------|---------|
| `components/DraftReview.test.tsx` | 56 tests, all failing |
| `DRAFT_REVIEW_IMPLEMENTATION_GUIDE.md` | Step-by-step implementation |
| `DRAFT_REVIEW_TEST_SUMMARY.txt` | Test reference |
| `RED_PHASE_COMPLETE.md` | Detailed phase summary |

## View Failing Tests

```bash
cd C:\Users\Travi\Desktop\convex-ai-bot\sovereign-agent
npm test -- components/DraftReview.test.tsx
```

Result: All 56 tests fail (component doesn't exist)

## Test Breakdown

- 10 Rendering tests
- 10 Interaction tests
- 8 State tests (loading, error)
- 8 Edge case tests
- 3 Structure tests
- 4 Accessibility tests

## Next: Create Component

Follow `DRAFT_REVIEW_IMPLEMENTATION_GUIDE.md` to:
1. Create `components/DraftReview.tsx`
2. Implement props and UI
3. Add state management
4. Watch tests turn green

## Key Props

```typescript
export function DraftReview({
  draft: { originalEmail, draftContent, priority, confidence },
  onApprove,
  onReject,
  onSave,
  isLoading,
  error,
}: DraftReviewProps)
```

## Key Features

- Display original email and AI draft
- Approve/Reject/Edit buttons
- Edit mode with save/cancel
- Loading and error states
- Accessibility compliant

## Required IDs

```
draft-review-container
priority-badge
confidence-badge
draft-content
original-email-body
draft-review-loading
draft-review-error
action-buttons
```

## Quick Commands

```bash
# Run tests
npm test -- components/DraftReview.test.tsx

# Watch mode
npm test -- --watch components/DraftReview.test.tsx

# One category
npm test -- components/DraftReview.test.tsx -t "Rendering"
```

---

See `RED_PHASE_COMPLETE.md` for full details.
