# Draft Regeneration Test Cases - Detailed Specifications

This document provides detailed specifications for each test case, organized by functional area.

## Test Suite: Draft Regeneration

**File:** `convex/draftRegeneration.test.ts`
**Total Tests:** 12
**Estimated Coverage:** 85% of draft regeneration module

---

## SECTION 1: regenerateDraft Action (4 Tests)

### Test 1.1: should create new draft version with user feedback

**Objective:** Verify that regenerating a draft creates a new, distinct document.

**Setup:**
1. Create an email in the database
2. Create an initial draft for that email

**Action:**
1. Call regenerate draft action with user feedback

**Expected Result:**
- New draft ID is returned
- New draft ID differs from original draft ID
- Both drafts exist in the database

**Implementation Requirement:**
```typescript
regenerateDraft(draftId: string, feedback: string) -> newDraftId: string
```

**Why This Test:** Ensures version history is maintained; new drafts don't overwrite old ones.

---

### Test 1.2: should include user feedback in OpenAI prompt

**Objective:** Verify user feedback is captured and included in OpenAI prompt.

**Setup:**
1. Create an email with specific subject and body
2. Create a draft for that email
3. Prepare user feedback text

**Action:**
1. Regenerate draft with feedback text
2. Inspect stored metadata

**Expected Result:**
- `metadata.userFeedback` contains the feedback string
- Feedback is passed to OpenAI API call

**Implementation Requirement:**
```typescript
draft.metadata = {
  ...existing,
  userFeedback: "Make it more professional"
}
```

**Why This Test:** Documents what feedback generated each version for audit trail.

---

### Test 1.3: should increment version number on regeneration

**Objective:** Verify version numbers track the regeneration history.

**Setup:**
1. Create email
2. Create v1 draft (version: 1)
3. Create v2 draft (version: 2)
4. Create v3 draft (version: 3)

**Action:**
1. Query all drafts for the email
2. Extract version numbers

**Expected Result:**
- v1.metadata.version = 1
- v2.metadata.version = 2
- v3.metadata.version = 3
- Each new regeneration increments version by 1

**Implementation Requirement:**
```typescript
const currentVersion = originalDraft.metadata?.version || 1;
const newVersion = currentVersion + 1;
newDraft.metadata.version = newVersion;
```

**Why This Test:** Enables user-friendly "v1, v2, v3" display in UI.

---

### Test 1.4: should preserve original draft when regenerating

**Objective:** Verify that original drafts remain intact after regeneration.

**Setup:**
1. Create email
2. Create original draft with specific content
3. Regenerate draft (creating new version)

**Action:**
1. Query both original and new draft
2. Compare content

**Expected Result:**
- Original draft still exists with original content
- Original draft can be queried independently
- New draft has different content

**Implementation Requirement:**
- Use `INSERT` for new draft, not `UPDATE`
- Never modify original draft document

**Why This Test:** Allows users to compare versions and roll back if needed.

---

## SECTION 2: scheduleDraft Mutation (3 Tests)

### Test 2.1: should set scheduledSendTime on draft

**Objective:** Verify scheduling metadata is stored correctly.

**Setup:**
1. Create email
2. Create draft
3. Calculate future timestamp (e.g., 1 hour from now)

**Action:**
1. Schedule draft with future timestamp
2. Query the draft

**Expected Result:**
- `metadata.scheduledSendTime` is set to provided timestamp
- Value is a number (Unix timestamp in milliseconds)
- Value is greater than current time

**Implementation Requirement:**
```typescript
await ctx.db.patch(draftId, {
  metadata: {
    ...draft.metadata,
    scheduledSendTime: 1704067200000  // Unix timestamp
  }
});
```

**Why This Test:** Enables email scheduling feature; required for send-later functionality.

---

### Test 2.2: should fail for past timestamps

**Objective:** Verify validation prevents scheduling in the past.

**Setup:**
1. Create email and draft
2. Calculate past timestamp (e.g., 1 hour ago)

**Action:**
1. Attempt to schedule with past timestamp
2. Catch error

**Expected Result:**
- Error is thrown with message like "Cannot schedule email for past time"
- Draft is NOT modified
- Validation happens before database write

**Implementation Requirement:**
```typescript
if (args.scheduledSendTime < Date.now()) {
  throw new Error("Cannot schedule email for past time");
}
```

**Why This Test:** Prevents invalid schedules; catches user/programmer errors early.

---

### Test 2.3: should update status to scheduled

**Objective:** Verify draft status reflects scheduling state.

**Setup:**
1. Create email
2. Create draft with initial status "draft"

**Action:**
1. Schedule the draft
2. Query draft again

**Expected Result:**
- Draft status indicates it's scheduled (either as status field or metadata flag)
- Draft metadata contains scheduling information

**Implementation Requirement:**
```typescript
// Option 1: Metadata flag
draft.metadata.isScheduled = true;
draft.metadata.scheduledSendTime = timestamp;

// Option 2: Status field (requires schema update)
draft.status = "scheduled";
```

**Note:** Current schema doesn't have "scheduled" status, so use metadata flag.

**Why This Test:** Allows filtering drafts by state (draft/scheduled/sent/discarded).

---

## SECTION 3: getDraftVersions Query (5 Tests)

### Test 3.1: should return all versions of a draft

**Objective:** Verify query retrieves all draft versions for an email.

**Setup:**
1. Create email
2. Create 3 draft versions for that email

**Action:**
1. Query getDraftVersions(emailId)
2. Count returned drafts

**Expected Result:**
- Returns array with exactly 3 drafts
- All IDs match created drafts
- All have correct emailId

**Implementation Requirement:**
```typescript
export const getDraftVersions = query({
  args: { emailId: v.id("emails") },
  handler: async (ctx, args) => {
    const drafts = await ctx.db
      .query("drafts")
      .withIndex("by_email_id", (q) => q.eq("emailId", args.emailId))
      .collect();
    return drafts;
  }
});
```

**Why This Test:** Ensures query is filtering correctly; prevents returning unrelated drafts.

---

### Test 3.2: should order versions by generatedAt descending

**Objective:** Verify drafts are sorted newest first.

**Setup:**
1. Create email
2. Insert drafts in non-sequential order:
   - v2 at time T+1000ms
   - v1 at time T
   - v3 at time T+2000ms

**Action:**
1. Query getDraftVersions(emailId)
2. Check sort order

**Expected Result:**
- Index 0: v3 (T+2000ms) - newest
- Index 1: v2 (T+1000ms) - middle
- Index 2: v1 (T) - oldest
- `versions[0].generatedAt > versions[1].generatedAt > versions[2].generatedAt`

**Implementation Requirement:**
```typescript
const drafts = await ctx.db.query("drafts")
  .withIndex("by_email_id", ...)
  .collect();

return drafts.sort((a, b) => b.generatedAt - a.generatedAt);
```

**Why This Test:** UI shows latest version first; users expect newest at top.

---

### Test 3.3: should handle empty version list for non-existent email

**Objective:** Verify query handles missing email gracefully.

**Setup:**
1. Don't create any drafts

**Action:**
1. Query getDraftVersions with non-existent emailId
2. Check result type

**Expected Result:**
- Returns empty array `[]`
- No error thrown
- Query completes successfully

**Implementation Requirement:**
```typescript
const drafts = await ctx.db.query("drafts")
  .withIndex("by_email_id", (q) => q.eq("emailId", args.emailId))
  .collect();

return drafts; // Will be []
```

**Why This Test:** Prevents null pointer errors; graceful handling of missing data.

---

### Test 3.4: should return only drafts for specified email

**Objective:** Verify query filters correctly by emailId (isolation).

**Setup:**
1. Create email1 and email2
2. Create 2 drafts for email1
3. Create 1 draft for email2

**Action:**
1. Query getDraftVersions(email1Id)
2. Query getDraftVersions(email2Id)

**Expected Result:**
- email1 query returns 2 drafts
- email2 query returns 1 draft
- No cross-contamination
- Each result only contains drafts for requested email

**Implementation Requirement:**
- Use `withIndex("by_email_id", ...)` for filtering
- Don't accidentally include all drafts

**Why This Test:** Prevents data leakage; ensures multi-user isolation.

---

### Test 3.5: should handle multiple regenerations maintaining history

**Objective:** Integration test verifying the complete regeneration workflow.

**Setup:**
1. Create email
2. Create initial draft (v1)
3. Regenerate with feedback 1 (v2)
4. Regenerate with feedback 2 (v3)

**Action:**
1. Query all versions
2. Verify each exists with correct version number

**Expected Result:**
- Query returns 3 drafts
- Each draft has correct version number
- All have correct emailId
- All exist in database

**Implementation Requirement:**
- All previous implementations working together

**Why This Test:** Validates entire workflow; catch integration issues.

---

## Test Data Specifications

### Email Object Structure
```typescript
interface Email {
  gmailId: string;          // "test-email-regen"
  threadId: string;         // "thread-regen"
  from: string;             // "sender@example.com"
  to: string;               // "recipient@example.com"
  subject: string;          // "Original Subject"
  body: string;             // "Original email body"
  snippet: string;          // "Original email"
  date: number;             // Date.now()
  receivedAt: number;       // Date.now()
  isRead: boolean;          // false
  isStarred: boolean;       // false
  isArchived: boolean;      // false
}
```

### Draft Object Structure
```typescript
interface Draft {
  _id: string;              // Generated ID
  emailId: string;          // Reference to email
  subject: string;          // "Re: Original Subject"
  body: string;             // "Draft response"
  generatedAt: number;      // Date.now()
  status: "draft" | "sent" | "discarded";
  metadata: {
    model: string;          // "gpt-4o-mini"
    temperature?: number;   // 0.7
    version?: number;       // 1, 2, 3...
    userFeedback?: string;  // "Make it more professional"
    scheduledSendTime?: number; // Future timestamp
  };
}
```

---

## Error Cases

### Error 1: Past Timestamp
```
Input: scheduledSendTime = Date.now() - 3600000
Expected Error: "Cannot schedule email for past time"
Status Code: Should throw Error
```

### Error 2: Non-Existent Draft
```
Input: draftId = "non-existent-id"
Expected Error: "Draft not found"
Status Code: Should throw Error
```

### Error 3: Non-Existent Email
```
Input: emailId = "non-existent-id"
Expected: Empty array returned (not an error)
Status Code: Success with empty result
```

---

## Performance Characteristics

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| regenerateDraft | 500-2000ms | Includes OpenAI API call |
| scheduleDraft | 10-50ms | Simple DB update |
| getDraftVersions (3 items) | 5-20ms | Index lookup |
| getDraftVersions (100 items) | 20-100ms | Sorting required |

---

## Test Independence

Each test is independent and:
- Creates its own test data
- Uses unique IDs
- Doesn't depend on execution order
- Cleans up after itself (implicit in convexTest)
- Can be run in any order
- Can be run individually

---

## Mocking Strategy

### OpenAI Mock
```typescript
vi.mock("openai", () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  subject: "Re: Test Subject - Revised",
                  body: "This is a regenerated draft"
                })
              }
            }]
          })
        }
      }
    }
  };
});
```

This prevents actual API calls while maintaining realistic response structure.

---

## Coverage Map

```
regenerateDraft action
├── ✓ Version creation
├── ✓ Feedback incorporation
├── ✓ Version numbering
└── ✓ History preservation

scheduleDraft mutation
├── ✓ Timestamp storage
├── ✓ Past validation
└── ✓ Status update

getDraftVersions query
├── ✓ All versions retrieval
├── ✓ Descending sort
├── ✓ Empty result handling
├── ✓ Email filtering
└── ✓ Integration workflow
```

---

## Running Individual Test Cases

```bash
# Run single test
npx vitest run convex/draftRegeneration.test.ts -t "should create new draft version"

# Run entire suite
npx vitest run convex/draftRegeneration.test.ts

# Run with verbose output
npx vitest run convex/draftRegeneration.test.ts --reporter=verbose
```
