# Implementation Guide: Draft Regeneration

This guide provides step-by-step instructions to implement the draft regeneration functionality and make all tests pass.

## Overview

The test suite defines three main features:
1. **Draft Regeneration:** Create new versions with user feedback
2. **Draft Scheduling:** Schedule when drafts should be sent
3. **Version History:** Query all versions of a draft with proper ordering

## Phase 1: Update Schema

### File: `convex/schema.ts`

Update the `drafts` table metadata to support new fields:

```typescript
metadata: v.optional(v.object({
  model: v.string(),
  temperature: v.optional(v.number()),
  version: v.optional(v.number()),              // NEW
  userFeedback: v.optional(v.string()),         // NEW
  scheduledSendTime: v.optional(v.number()),    // NEW
  reasoning: v.optional(v.string()),
})),
```

**Why:** Tests expect these fields in metadata to track versions, feedback, and scheduling.

## Phase 2: Create Draft Actions

### File: `convex/draftActions.ts` (NEW)

Create a new file for draft generation actions that use OpenAI:

```typescript
import { action } from "convex/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { api } from "./_generated/api";

export const regenerateDraft = action({
  args: {
    draftId: v.id("drafts"),
    userFeedback: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get the original draft
    const originalDraft = await ctx.runQuery(api.draftQueries.getDraft, {
      id: args.draftId,
    });

    if (!originalDraft) {
      throw new Error("Draft not found");
    }

    // 2. Get the associated email
    const email = await ctx.runQuery(api.emails.getEmail, {
      id: originalDraft.emailId,
    });

    if (!email) {
      throw new Error("Associated email not found");
    }

    // 3. Call OpenAI with feedback
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const currentVersion = originalDraft.metadata?.version || 1;
    const prompt = `Generate an email reply draft based on user feedback.

Original Email:
Subject: ${email.subject}
Body: ${email.body}

Previous Draft:
Subject: ${originalDraft.subject}
Body: ${originalDraft.body}

User Feedback: ${args.userFeedback}

Return JSON with: subject (include "Re:"), body (complete draft text)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an email draft generator. Generate professional, contextually appropriate email replies based on user feedback. Return only valid JSON with subject and body fields.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || "{}";
    const result = JSON.parse(content);

    // 4. Create new draft version
    const newDraftId = await ctx.runMutation(
      api.draftMutations.createDraft,
      {
        emailId: originalDraft.emailId,
        subject: result.subject || `Re: ${email.subject}`,
        body: result.body || "Thank you for your email.",
        version: currentVersion + 1,
        userFeedback: args.userFeedback,
      }
    );

    return { draftId: newDraftId, version: currentVersion + 1 };
  },
});
```

**Key Points:**
- Takes original draft ID and feedback as arguments
- Retrieves the original draft and associated email
- Includes feedback in OpenAI prompt
- Increments version number
- Returns new draft ID

## Phase 3: Create Draft Mutations

### File: `convex/draftMutations.ts` (NEW)

Create mutations for modifying drafts:

```typescript
import { mutation } from "convex/server";
import { v } from "convex/values";

export const createDraft = mutation({
  args: {
    emailId: v.id("emails"),
    subject: v.string(),
    body: v.string(),
    version: v.optional(v.number()),
    userFeedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const draftId = await ctx.db.insert("drafts", {
      emailId: args.emailId,
      subject: args.subject,
      body: args.body,
      generatedAt: Date.now(),
      status: "draft",
      metadata: {
        model: "gpt-4o-mini",
        temperature: 0.7,
        version: args.version || 1,
        userFeedback: args.userFeedback,
      },
    });

    return draftId;
  },
});

export const scheduleDraft = mutation({
  args: {
    draftId: v.id("drafts"),
    scheduledSendTime: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate that timestamp is not in the past
    if (args.scheduledSendTime < Date.now()) {
      throw new Error("Cannot schedule email for past time");
    }

    // Get the draft
    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      throw new Error("Draft not found");
    }

    // Update with scheduled time
    await ctx.db.patch(args.draftId, {
      metadata: {
        ...draft.metadata,
        scheduledSendTime: args.scheduledSendTime,
      },
    });

    return args.draftId;
  },
});

export const updateDraft = mutation({
  args: {
    draftId: v.id("drafts"),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = {};

    if (args.subject !== undefined) {
      updates.subject = args.subject;
    }
    if (args.body !== undefined) {
      updates.body = args.body;
    }

    await ctx.db.patch(args.draftId, updates);

    return args.draftId;
  },
});
```

**Key Points:**
- `createDraft`: Inserts new draft with metadata
- `scheduleDraft`: Validates future timestamp, stores in metadata
- `updateDraft`: Allows editing draft content

## Phase 4: Create Draft Queries

### File: `convex/draftQueries.ts` (NEW)

Create queries for retrieving drafts:

```typescript
import { query } from "convex/server";
import { v } from "convex/values";

export const getDraft = query({
  args: { id: v.id("drafts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getDraftVersions = query({
  args: { emailId: v.id("emails") },
  handler: async (ctx, args) => {
    // Query drafts for this email using index
    const drafts = await ctx.db
      .query("drafts")
      .withIndex("by_email_id", (q) => q.eq("emailId", args.emailId))
      .collect();

    // Sort by generatedAt descending (newest first)
    return drafts.sort((a, b) => b.generatedAt - a.generatedAt);
  },
});

export const listDraftsByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const drafts = await ctx.db
      .query("drafts")
      .withIndex("by_status", (q) => q.eq("status", args.status as any))
      .collect();

    return drafts.sort((a, b) => b.generatedAt - a.generatedAt);
  },
});

export const getDraftCount = query({
  args: { emailId: v.id("emails") },
  handler: async (ctx, args) => {
    const drafts = await ctx.db
      .query("drafts")
      .withIndex("by_email_id", (q) => q.eq("emailId", args.emailId))
      .collect();

    return drafts.length;
  },
});
```

**Key Points:**
- `getDraft`: Retrieve single draft by ID
- `getDraftVersions`: Get all versions for an email, sorted newest first
- `listDraftsByStatus`: Filter by draft status
- `getDraftCount`: Count drafts for an email

## Phase 5: Update API Exports

### File: `convex/_generated/api.d.ts` (AUTO-GENERATED)

After implementing the above, Convex will auto-generate the API types. Make sure to run:

```bash
npx convex dev
```

This will:
1. Validate your schema changes
2. Generate TypeScript types
3. Create the API export file automatically

## Phase 6: Run Tests

```bash
# Run the test suite
npx vitest run convex/draftRegeneration.test.ts

# Run with coverage report
npx vitest run convex/draftRegeneration.test.ts --coverage

# Run in watch mode during development
npx vitest convex/draftRegeneration.test.ts
```

## Expected Test Results

After implementation, all 12 tests should pass:

```
✓ convex/draftRegeneration.test.ts (12 tests) 500ms
  ✓ Draft Regeneration (12)
    ✓ regenerateDraft action (4)
      ✓ should create new draft version with user feedback
      ✓ should include user feedback in OpenAI prompt
      ✓ should increment version number on regeneration
      ✓ should preserve original draft when regenerating
    ✓ scheduleDraft mutation (3)
      ✓ should set scheduledSendTime on draft
      ✓ should fail for past timestamps
      ✓ should update status to scheduled
    ✓ getDraftVersions query (5)
      ✓ should return all versions of a draft
      ✓ should order versions by generatedAt descending
      ✓ should handle empty version list for non-existent email
      ✓ should return only drafts for specified email
      ✓ should handle multiple regenerations maintaining history
```

## Troubleshooting

### Issue: `Cannot find module 'convex'`
**Solution:** Run `npx convex dev` to generate types

### Issue: Tests timeout
**Solution:** Increase timeout in vitest.config.ts:
```typescript
test: {
  testTimeout: 10000,
}
```

### Issue: `metadata.version is undefined`
**Solution:** Ensure createDraft passes version in metadata

### Issue: Tests still failing after implementation
**Solution:** Check that:
1. Schema was deployed: `npx convex deploy`
2. All three files created: draftActions, draftMutations, draftQueries
3. API exports are generated: Check `_generated/api.d.ts`

## Integration with Existing Code

### Connect to Draft Generation (lib/draft-generator.ts)

Update your draft generation to use the new mutation:

```typescript
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

export function useCreateDraft() {
  return useMutation(api.draftMutations.createDraft);
}

// In your component:
const createDraft = useCreateDraft();

const draft = await generateDraft(email, "inquiry", preferences);
const draftId = await createDraft({
  emailId,
  subject: draft.subject,
  body: draft.body,
  version: 1,
});
```

### Connect to Email UI

```typescript
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

function DraftVersionHistory({ emailId }) {
  const versions = useQuery(api.draftQueries.getDraftVersions, { emailId });

  return (
    <div>
      {versions?.map((draft) => (
        <div key={draft._id}>
          <h3>v{draft.metadata?.version || 1}</h3>
          <p>{draft.body}</p>
        </div>
      ))}
    </div>
  );
}
```

## File Structure After Implementation

```
convex/
├── schema.ts                    (UPDATED: metadata fields)
├── draftActions.ts              (NEW: regenerateDraft action)
├── draftMutations.ts            (NEW: schedule, update mutations)
├── draftQueries.ts              (NEW: version retrieval queries)
├── draftRegeneration.test.ts    (EXISTING: test suite)
├── _generated/
│   └── api.d.ts                 (AUTO-GENERATED: API types)
└── ... existing files
```

## Running the Full Test Suite

After implementation, verify the entire test suite passes:

```bash
# All Convex tests
npx vitest run convex/**/*.test.ts

# All tests including lib
npm test

# With coverage
npm test -- --coverage
```

## Next: REFACTOR Phase

Once all tests pass (GREEN phase), consider:
1. Extract OpenAI prompt logic to a separate function
2. Add error handling and retry logic
3. Add pagination to version queries
4. Implement batch regeneration
5. Add analytics/logging for regenerations
