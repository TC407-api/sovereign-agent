# DraftReview Component - Implementation Guide

## Current Status: RED PHASE ✅

**File:** `components/DraftReview.test.tsx`
- **Lines:** 444
- **Test Cases:** 56 (all failing)
- **Status:** Ready for implementation

## Quick Start

### 1. View Test Results
```bash
npm test -- components/DraftReview.test.tsx
```

Expected output: **56 failing tests** (component doesn't exist)

### 2. Create Component File
```bash
# Create new file
touch components/DraftReview.tsx
```

## Component Specification

### Component Signature
```typescript
interface DraftReviewProps {
  draft: {
    id: string;
    originalEmail: {
      id: string;
      from: string;
      subject: string;
      date: Date;
      body?: string;
      priority: 'high' | 'low' | 'medium' | 'normal';
    };
    draftContent: string;
    priority: 'high' | 'low' | 'medium' | 'normal';
    confidence: number; // 0-1
    status: 'pending' | 'processing' | 'approved' | 'rejected';
  };
  onApprove: (draftId: string) => void;
  onReject: (draftId: string) => void;
  onSave: (draftId: string, content: string) => void;
  isLoading?: boolean;
  error?: string;
}

export function DraftReview(props: DraftReviewProps): ReactNode
```

## Implementation Checklist

### Phase 1: Basic Rendering
- [ ] Render main container with `data-testid="draft-review-container"`
- [ ] Display original email subject (from `draft.originalEmail.subject`)
- [ ] Display original email sender (from `draft.originalEmail.from`)
- [ ] Display draft content (from `draft.draftContent`)
- [ ] Show section headers ("Original Email", "AI-Generated Reply")
- [ ] Import and use existing `PriorityBadge` component

### Phase 2: Confidence & Priority Display
- [ ] Add confidence badge showing `Math.round(draft.confidence * 100)%`
- [ ] Use `PriorityBadge` for priority display
- [ ] Add `data-testid="confidence-badge"` to confidence display
- [ ] Add `data-testid="priority-badge"` (via PriorityBadge)

### Phase 3: Action Buttons
- [ ] Create action buttons section with `data-testid="action-buttons"`
- [ ] Render "Approve" button
- [ ] Render "Reject" button
- [ ] Render "Edit" button
- [ ] Wire up onClick handlers

### Phase 4: Button Actions
- [ ] Call `onApprove(draft.id)` when approve clicked
- [ ] Call `onReject(draft.id)` when reject clicked
- [ ] Toggle edit mode when edit clicked

### Phase 5: Edit Mode
- [ ] Add local state for edit mode toggle
- [ ] Show textarea in edit mode with current draft content
- [ ] Add "Save" button in edit mode
- [ ] Add "Cancel" button in edit mode
- [ ] Call `onSave(draft.id, editedContent)` on save
- [ ] Exit edit mode on save or cancel
- [ ] Preserve original content if cancel clicked

### Phase 6: Loading State
- [ ] Accept `isLoading` prop
- [ ] Show loading indicator when `isLoading={true}`
- [ ] Add `data-testid="draft-review-loading"` to loader
- [ ] Add `aria-busy="true"` to loading element
- [ ] Disable all action buttons during loading

### Phase 7: Error State
- [ ] Accept `error` prop (optional string)
- [ ] Display error message when provided
- [ ] Add `data-testid="draft-review-error"` to error element
- [ ] Add `role="alert"` to error element
- [ ] Disable action buttons in error state

### Phase 8: Additional Elements
- [ ] Add `data-testid="original-email-body"` to email body display
- [ ] Add `data-testid="draft-content"` to draft content display

### Phase 9: Styling (Tailwind)
- Use existing project's Tailwind classes
- Match styling from `PriorityBadge` and `EmailCard` components
- Ensure responsive design
- Use consistent spacing and colors

### Phase 10: Accessibility
- [ ] Use semantic HTML (h2 for headers)
- [ ] Proper button labels
- [ ] ARIA attributes for loading/error states
- [ ] Keyboard navigation support
- [ ] Form controls properly labeled

## Testing as You Build

### Run tests continuously
```bash
npm test -- --watch components/DraftReview.test.tsx
```

### Run specific test suite
```bash
# Just rendering tests
npm test -- components/DraftReview.test.tsx -t "Rendering"

# Just interactions
npm test -- components/DraftReview.test.tsx -t "Interactions"

# Just edit mode
npm test -- components/DraftReview.test.tsx -t "Edit Mode"
```

## Reference Components

### PriorityBadge (Already Exists)
```typescript
// Located: components/PriorityBadge.tsx
import { PriorityBadge } from './PriorityBadge';

<PriorityBadge priority="high" />
```

Outputs: Badge with emoji, label, and color coding

### EmailCard (Reference)
```typescript
// Located: components/EmailCard.tsx
// Good example of:
// - Proper data-testid naming
// - Tailwind styling patterns
// - Using existing components
```

## Typical Implementation Order

1. **Basic structure** → All rendering tests pass
2. **Priority & confidence** → Rendering tests pass
3. **Buttons & handlers** → Interaction tests pass
4. **Edit mode state** → Edit mode tests pass
5. **Loading state** → State tests pass
6. **Error handling** → Error tests pass
7. **Edge cases** → Edge case tests pass
8. **Accessibility** → Accessibility tests pass

## Expected Test Results Timeline

| Step | Expected Passing | Expected Failing |
|------|------------------|------------------|
| Start | 0/56 | 56 |
| After basic render | 10/56 | 46 |
| After buttons wired | 13/56 | 43 |
| After edit mode | 20/56 | 36 |
| After loading | 24/56 | 32 |
| After error handling | 28/56 | 28 |
| Final (complete) | 56/56 | 0 |

## Tips for Implementation

1. **Start small:** Get rendering tests passing first
2. **Use the test file as spec:** Every test describes exact behavior
3. **Copy patterns:** Look at `EmailCard` and `PriorityBadge` for style/structure
4. **Test data is in tests:** Use `mockDraftData` and `mockOriginalEmail` to understand expected structure
5. **Data-testid is your friend:** The test file specifies all required IDs

## Common Patterns Used

### Conditional Rendering
```typescript
{isLoading && <div data-testid="draft-review-loading">...</div>}
{error && <div data-testid="draft-review-error" role="alert">...</div>}
{isEditMode && <textarea />}
```

### Event Handlers
```typescript
const handleApprove = () => onApprove(draft.id);
const handleSave = () => onSave(draft.id, editedContent);
```

### Percentage Calculation
```typescript
const confidencePercent = Math.round(draft.confidence * 100);
// Display: "87%"
```

## Questions?

If a test seems unclear:
1. Read the test case in `DraftReview.test.tsx`
2. Look at the mock data to understand expected structure
3. Check the Rendering section to see what's expected
4. Reference existing components (PriorityBadge, EmailCard)

## Next Phase: GREEN

Once all tests pass, the component is ready for:
- Integration with Convex data layer
- API endpoint wiring
- Production deployment
- Further refinement in REFACTOR phase
