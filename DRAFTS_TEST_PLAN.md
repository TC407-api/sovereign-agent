# TDD RED PHASE: Draft Approval Mutations Test Plan

## Test File Created
**File:** `convex/drafts.test.ts`
**Status:** RED (tests failing as expected)
**Framework:** Vitest + convex-test

## Test Cases Defined

### 1. approveDraft Mutation
| # | Test Case | Priority |
|---|-----------|----------|
| 1.1 | Should mark draft status as 'approved' | P0 |
| 1.2 | Should set approvedAt timestamp when approved | P0 |
| 1.3 | Should fail if draft does not exist | P1 |

### 2. rejectDraft Mutation
| # | Test Case | Priority |
|---|-----------|----------|
| 2.1 | Should mark draft status as 'rejected' | P0 |
| 2.2 | Should set rejectedAt timestamp when rejected | P0 |
| 2.3 | Should store rejection reason | P0 |
| 2.4 | Should fail if draft does not exist | P1 |

### 3. updateDraft Mutation
| # | Test Case | Priority |
|---|-----------|----------|
| 3.1 | Should update draft content (subject/body) | P0 |
| 3.2 | Should preserve originalContent field | P0 |
| 3.3 | Should increment editCount on each update | P0 |
| 3.4 | Should fail if draft does not exist | P1 |

### 4. createDraft Helper (Used in Tests)
| # | Test Case | Priority |
|---|-----------|----------|
| 4.1 | Should create draft with status 'draft' | P0 |
| 4.2 | Should initialize editCount to 0 | P0 |
| 4.3 | Should store originalContent on creation | P0 |

## Schema Extensions Required

The tests expect these new fields in the `drafts` table:

```typescript
drafts: defineTable({
  // Existing fields
  emailId: v.id("emails"),
  subject: v.string(),
  body: v.string(),
  generatedAt: v.number(),
  status: v.union(
    v.literal("draft"),
    v.literal("sent"),
    v.literal("discarded"),
    v.literal("approved"),      // NEW
    v.literal("rejected")       // NEW
  ),
  metadata: v.optional(v.object({
    model: v.string(),
    temperature: v.optional(v.number()),
  })),
  
  // NEW FIELDS for approval workflow
  originalContent: v.string(),   // NEW - preserve initial generation
  editCount: v.number(),         // NEW - track edits
  approvedAt: v.optional(v.number()), // NEW - approval timestamp
  rejectedAt: v.optional(v.number()), // NEW - rejection timestamp
  rejectionReason: v.optional(v.string()), // NEW - why rejected
})
```

## Current Test Output

```
FAIL convex/drafts.test.ts
Error: Failed to resolve import "./drafts" from "convex/drafts.test.ts"
Does the file exist?
```

This is expected - we're in the RED phase. The `./drafts.ts` file with the mutations doesn't exist yet.

## Next Steps (GREEN Phase)

1. Create `convex/drafts.ts` with mutation implementations:
   - `createDraft(ctx, args)` - initializes new draft
   - `approveDraft(ctx, args)` - marks draft as approved
   - `rejectDraft(ctx, args)` - marks draft as rejected with reason
   - `updateDraft(ctx, args)` - updates content and increments editCount

2. Update `convex/schema.ts` with new fields

3. Run tests again to verify they pass

## Test Statistics

- **Total Tests:** 15
- **Describe Blocks:** 5
- **Happy Path Tests:** 11 (P0 priority)
- **Error Handling Tests:** 4 (P1 priority)
- **Coverage Target:** 100% of mutation functions
