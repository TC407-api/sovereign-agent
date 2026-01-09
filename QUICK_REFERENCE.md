# Draft Regeneration Tests - Quick Reference Card

## At a Glance

**Test File:** `convex/draftRegeneration.test.ts` (848 lines)
**Total Tests:** 12 (all FAILING - RED phase)
**Status:** Ready for implementation

---

## 12 Test Cases

### regenerateDraft action (4)
1. ✗ should create new draft version with user feedback
2. ✗ should include user feedback in OpenAI prompt
3. ✗ should increment version number on regeneration
4. ✗ should preserve original draft when regenerating

### scheduleDraft mutation (3)
5. ✗ should set scheduledSendTime on draft
6. ✗ should fail for past timestamps
7. ✗ should update status to scheduled

### getDraftVersions query (5)
8. ✗ should return all versions of a draft
9. ✗ should order versions by generatedAt descending
10. ✗ should handle empty version list for non-existent email
11. ✗ should return only drafts for specified email
12. ✗ should handle multiple regenerations maintaining history

---

## Key Test Features

| Feature | Detail |
|---------|--------|
| **Mocking** | OpenAI API mocked; Convex DB real |
| **Isolation** | Each test independent |
| **Data** | Creates its own test data |
| **Cleanup** | Automatic (convexTest) |
| **Order** | Can run in any order |

---

## Implementation Files Needed

```
convex/
├── schema.ts                    ← UPDATE (add metadata fields)
├── draftActions.ts              ← CREATE (regenerateDraft action)
├── draftMutations.ts            ← CREATE (scheduleDraft, createDraft mutations)
├── draftQueries.ts              ← CREATE (getDraftVersions, getDraft queries)
└── draftRegeneration.test.ts    ← EXISTING (test file)
```

---

## Schema Update

Add to `drafts` table metadata:

```typescript
metadata: v.optional(v.object({
  model: v.string(),
  temperature: v.optional(v.number()),
  version: v.optional(v.number()),              // NEW
  userFeedback: v.optional(v.string()),         // NEW
  scheduledSendTime: v.optional(v.number()),    // NEW
})),
```

---

## Implementation Checklist

- [ ] Update schema.ts (metadata fields)
- [ ] Create draftActions.ts (regenerateDraft)
- [ ] Create draftMutations.ts (scheduleDraft, createDraft)
- [ ] Create draftQueries.ts (getDraftVersions)
- [ ] Run `npx convex dev`
- [ ] Run tests: `npx vitest run convex/draftRegeneration.test.ts`
- [ ] All 12 tests pass (GREEN phase)

---

## Running Tests

```bash
# All tests
npx vitest run convex/draftRegeneration.test.ts

# Single test
npx vitest run convex/draftRegeneration.test.ts -t "should create new draft"

# Watch mode
npx vitest convex/draftRegeneration.test.ts

# With coverage
npx vitest run convex/draftRegeneration.test.ts --coverage
```

---

## Test Data Structure

### Email
```typescript
{
  gmailId, threadId, from, to,
  subject, body, snippet,
  date, receivedAt,
  isRead, isStarred, isArchived
}
```

### Draft
```typescript
{
  emailId,
  subject,
  body,
  generatedAt,
  status: "draft" | "sent" | "discarded",
  metadata: {
    model,
    temperature,
    version,
    userFeedback,
    scheduledSendTime
  }
}
```

---

## Core Operations Tested

### 1. Regenerate Draft
```
Input: draftId, userFeedback
Output: newDraftId (different from original)
Result: New draft created with incremented version
```

### 2. Schedule Draft
```
Input: draftId, scheduledSendTime (future)
Validation: Must be future timestamp
Output: draftId updated
Result: metadata.scheduledSendTime set
```

### 3. Get Versions
```
Input: emailId
Output: Array of drafts
Sorting: By generatedAt descending (newest first)
Filter: Only for specified emailId
```

---

## Error Scenarios

| Scenario | Handling |
|----------|----------|
| Past timestamp | Throw error before DB write |
| Non-existent email | Return empty array |
| Missing draft | Throw error in regenerate |

---

## Quick Facts

- **Lines of test code:** 848
- **Test frameworks:** Vitest, Convex-test
- **Mocked services:** OpenAI
- **Real services:** Convex database
- **Estimated implementation time:** 2-4 hours
- **Test execution time:** ~500ms
- **Code coverage target:** 85%

---

## Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| `TEST_REPORT.md` | Execution results & analysis | 5 min |
| `TEST_CASES.md` | Detailed specs per test | 15 min |
| `IMPLEMENTATION_GUIDE.md` | Step-by-step implementation | 10 min |
| `DRAFT_REGEN_SUMMARY.md` | Full overview | 10 min |
| `QUICK_REFERENCE.md` | This file - at a glance | 2 min |

---

## Success Indicators (GREEN Phase)

✓ All 12 tests passing
✓ No test timeouts
✓ No console errors
✓ Database transactions clean
✓ OpenAI mock working
✓ Version tracking correct
✓ Sorting correct
✓ Filtering correct

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `npx convex dev` |
| Tests timeout | Increase timeout in vitest.config.ts |
| metadata undefined | Check createDraft passes metadata |
| Version not incrementing | Verify version logic in action |
| Wrong sort order | Check sort is `(a,b) => b - a` not `a - a` |

---

## Next Action

→ Open `IMPLEMENTATION_GUIDE.md`
→ Start with Phase 1: Update schema
→ Follow checklist in order

---

## Legend

- ✗ Test failing (RED phase)
- ✓ Feature to implement
- [ ] Checkbox to complete

---

**Last Updated:** 2026-01-09
**Status:** Red Phase Complete - Ready for Implementation
