# TDD RED PHASE Complete: Draft Approval Mutations

## Deliverable Status: COMPLETE

### File Created
- **Path:** `C:\Users\Travi\Desktop\convex-ai-bot\sovereign-agent\convex\drafts.test.ts`
- **Size:** 488 lines
- **Framework:** Vitest + convex-test
- **Status:** RED (all tests failing as expected)

## Test Cases Written (14 Total)

### approveDraft Mutation Tests (3)
1. ✗ Should mark draft status as 'approved'
2. ✗ Should set approvedAt timestamp when draft is approved
3. ✗ Should fail if draft does not exist

### rejectDraft Mutation Tests (4)
4. ✗ Should mark draft status as 'rejected'
5. ✗ Should set rejectedAt timestamp when draft is rejected
6. ✗ Should store rejection reason
7. ✗ Should fail if draft does not exist

### updateDraft Mutation Tests (4)
8. ✗ Should update draft content
9. ✗ Should preserve originalContent when updating
10. ✗ Should increment editCount on each update
11. ✗ Should fail if draft does not exist

### createDraft Helper Tests (3)
12. ✗ Should create a draft with status 'draft'
13. ✗ Should initialize editCount to 0
14. ✗ Should store originalContent on creation

## Test Structure

Each test follows the Arrange-Act-Assert pattern:
- **Arrange:** Insert test email, create draft with known data
- **Act:** Call the mutation being tested
- **Assert:** Verify expected state changes using convex-test's `t.run()` for DB reads

## Required Implementations (GREEN Phase)

### 1. Schema Extensions (convex/schema.ts)
Update the `drafts` table definition to include:
```typescript
originalContent: v.string()           // Preserve initial generation
editCount: v.number()                 // Track number of edits
approvedAt: v.optional(v.number())    // Approval timestamp
rejectedAt: v.optional(v.number())    // Rejection timestamp
rejectionReason: v.optional(v.string()) // Why rejected
```

Also add new status values:
- `v.literal("approved")`
- `v.literal("rejected")`

### 2. Mutation Implementations (convex/drafts.ts)
Create new file with:
```typescript
export const createDraft = mutation({...})
export const approveDraft = mutation({...})
export const rejectDraft = mutation({...})
export const updateDraft = mutation({...})
```

## Test Execution

**Command to run tests:**
```bash
cd C:\Users\Travi\Desktop\convex-ai-bot\sovereign-agent
pnpm test convex/drafts.test.ts
```

**Current output:**
```
FAIL convex/drafts.test.ts
Error: Failed to resolve import "./drafts" from "convex/drafts.test.ts"
Does the file exist?
```

This is CORRECT for the RED phase - the mutations don't exist yet.

## Configuration Changes

Updated `vitest.config.ts`:
- Removed `'convex/**/*.test.ts'` from exclude list
- Tests in convex/ directory now run with `pnpm test`

## Test Design Notes

1. **Email Setup:** Each test creates a real email first (required due to FK constraint)
2. **Isolation:** Each test uses a fresh `convexTest(schema)` instance
3. **Assertions:** Mix of state verification and timestamp validation
4. **Error Cases:** Tests verify exceptions thrown for non-existent drafts
5. **Field Tracking:** Tests verify editCount increments and originalContent preservation

## Coverage Plan

These tests provide:
- **Line Coverage:** 100% of draft mutations (when implemented)
- **Branch Coverage:** Happy path + error cases
- **Integration:** Tests interact with emails table (verifies FK relationships)

## Ready for Implementation

The test suite is comprehensive and ready to guide implementation. Once mutations are created and schema is updated, run:

```bash
pnpm test convex/drafts.test.ts
```

To move from RED → GREEN phase.
