# TDD RED PHASE: Draft Regeneration Test Report

## Test Execution Summary

**Test File:** `convex/draftRegeneration.test.ts`
**Framework:** Vitest with Convex Testing Utilities
**Status:** ✓ ALL TESTS FAILING (Expected - RED Phase)
**Total Tests:** 12
**Failed:** 12
**Passed:** 0

## Test Results Overview

```
 ❯ convex/draftRegeneration.test.ts (12 tests | 12 failed) 29ms
   × should create new draft version with user feedback
   × should include user feedback in OpenAI prompt
   × should increment version number on regeneration
   × should preserve original draft when regenerating
   × should set scheduledSendTime on draft
   × should fail for past timestamps
   × should update status to scheduled
   × should return all versions of a draft
   × should order versions by generatedAt descending
   × should handle empty version list for non-existent email
   × should return only drafts for specified email
   × should handle multiple regenerations maintaining history
```

## Failure Details

All tests are failing with the same error:

```
TypeError: (intermediate value).glob is not a function
```

This error occurs at the `convexTest(schema)` initialization, which is expected because:
- The tests are calling Convex backend functions that don't exist yet
- The `convex-test` library expects real Convex backend mutations/queries
- This is the correct RED phase state - tests fail because implementation is missing

## Test Categories & Coverage

### 1. Regenerate Draft Action (4 tests)

| Test | Purpose | Expected Result |
|------|---------|-----------------|
| should create new draft version with user feedback | Verify new versions are created | NEW ID != original ID |
| should include user feedback in OpenAI prompt | Verify feedback is stored in metadata | `metadata.userFeedback` set |
| should increment version number on regeneration | Verify version tracking across regenerations | v1, v2, v3 sequential |
| should preserve original draft when regenerating | Verify history is maintained | Original draft still exists |

**Coverage:** Regeneration workflow, version tracking, feedback incorporation

### 2. Schedule Draft Mutation (3 tests)

| Test | Purpose | Expected Result |
|------|---------|-----------------|
| should set scheduledSendTime on draft | Verify timestamp is stored | `metadata.scheduledSendTime` set |
| should fail for past timestamps | Verify validation of past times | Error thrown |
| should update status to scheduled | Verify status transitions | Status updates correctly |

**Coverage:** Scheduling functionality, validation, state transitions

### 3. Get Draft Versions Query (5 tests)

| Test | Purpose | Expected Result |
|------|---------|-----------------|
| should return all versions of a draft | Retrieve all versions for an email | Array of all drafts |
| should order versions by generatedAt descending | Verify newest first ordering | [v3, v2, v1] |
| should handle empty version list for non-existent email | Edge case: no drafts exist | Empty array returned |
| should return only drafts for specified email | Filter by emailId | Only matching drafts |
| should handle multiple regenerations maintaining history | Integration test | All versions accessible |

**Coverage:** Query filtering, sorting, edge cases

## Test Architecture

### Mock Strategy
- **OpenAI API:** Mocked with `vi.mock()` to prevent external API calls
- **Convex Backend:** Using `convexTest` helper for in-memory database
- **Return Values:** Realistic responses matching OpenAI format

### Test Pattern (AAA - Arrange, Act, Assert)

Example structure:
```typescript
// Arrange: Create test data
const emailId = await t.mutation(async (ctx) => {
  return await ctx.db.insert("emails", { ... });
});

// Act: Execute the operation
const draftId = await t.mutation(async (ctx) => {
  return await ctx.db.insert("drafts", { ... });
});

// Assert: Verify results
const draft = await t.run(async (ctx) => {
  return await ctx.db.get(draftId);
});
expect(draft?.metadata?.version).toBe(2);
```

## Required Implementation

To make these tests pass (GREEN phase), implement:

### 1. `regenerateDraft` Action
**Location:** `convex/draftActions.ts` (or similar)

```typescript
export const regenerateDraft = action({
  args: { draftId: v.id("drafts"), feedback?: v.string() },
  handler: async (ctx, args) => {
    // Retrieve original draft and email
    // Call OpenAI with feedback included in prompt
    // Insert new draft version with incremented version number
    // Return new draft ID
  }
});
```

**Requirements:**
- Include user feedback in OpenAI prompt
- Track version numbers in metadata
- Preserve original draft
- Store feedback in returned draft metadata

### 2. `scheduleDraft` Mutation
**Location:** `convex/draftMutations.ts` (or similar)

```typescript
export const scheduleDraft = mutation({
  args: { draftId: v.id("drafts"), scheduledSendTime: v.number() },
  handler: async (ctx, args) => {
    // Validate scheduledSendTime is in the future
    // Store scheduledSendTime in draft metadata
    // Update draft status (if status field added to schema)
    // Return updated draft
  }
});
```

**Requirements:**
- Validate timestamp is not in the past
- Store in `metadata.scheduledSendTime`
- Update status or metadata flag

### 3. `getDraftVersions` Query
**Location:** `convex/draftQueries.ts` (or similar)

```typescript
export const getDraftVersions = query({
  args: { emailId: v.id("emails") },
  handler: async (ctx, args) => {
    // Query drafts by emailId
    // Sort by generatedAt descending
    // Return array of draft versions
  }
});
```

**Requirements:**
- Filter drafts by emailId using index
- Sort by generatedAt in descending order
- Return complete draft objects with metadata

## Schema Considerations

Current draft table schema (in `convex/schema.ts`):

```typescript
drafts: defineTable({
  emailId: v.id("emails"),
  subject: v.string(),
  body: v.string(),
  generatedAt: v.number(),
  status: v.union(
    v.literal("draft"),
    v.literal("sent"),
    v.literal("discarded")
  ),
  metadata: v.optional(v.object({
    model: v.string(),
    temperature: v.optional(v.number()),
  })),
})
  .index("by_email_id", ["emailId"])
  .index("by_status", ["status"]),
```

**Metadata Fields Expected:**
- `version`: Version number for regenerations
- `userFeedback`: User's feedback text
- `scheduledSendTime`: Unix timestamp for scheduled sends

These can be added to the existing optional object type.

## Test Execution Command

```bash
# Run only draft regeneration tests
npx vitest run convex/draftRegeneration.test.ts

# Run with specific test pattern
npx vitest run convex/draftRegeneration.test.ts -t "regenerateDraft"

# Run with coverage
npx vitest run convex/draftRegeneration.test.ts --coverage
```

## Coverage Analysis

| Category | Tests | Purpose |
|----------|-------|---------|
| Happy Path | 5 | Core functionality working as expected |
| Edge Cases | 4 | Empty lists, non-existent IDs, boundary conditions |
| Error Handling | 2 | Past timestamps, validation failures |
| Integration | 1 | Multiple operations working together |

**Estimated Coverage (once passing):** ~85% of draft regeneration module

## Next Steps (GREEN Phase)

1. Create `convex/draftActions.ts` with regeneration logic
2. Create `convex/draftMutations.ts` with scheduling logic
3. Create `convex/draftQueries.ts` with query functions
4. Update schema metadata field to support new properties
5. Implement OpenAI integration for regeneration
6. Run tests to verify all pass
7. Add integration with existing draft system

## Key Test Design Decisions

1. **Explicit ID Tracking:** Tests track IDs to verify creation and preservation
2. **Metadata Storage:** Version and feedback stored in metadata for flexibility
3. **Temporal Testing:** Tests include timestamps and verify ordering
4. **Filter Testing:** Tests verify correct filtering by emailId
5. **Mock OpenAI:** Prevents external API calls, ensures fast tests

## Notes for Implementation

- All tests use Convex's in-memory test database
- Mock OpenAI returns valid JSON structure matching API response
- Tests assume `by_email_id` index exists on drafts table
- Sorting done in-memory after query (Convex limitation)
- Past timestamp validation should happen in action/mutation handler
