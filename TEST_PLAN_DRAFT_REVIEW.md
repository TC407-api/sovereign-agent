# DraftReview Component - Test Plan (RED PHASE)

## Test File Location
`C:\Users\Travi\Desktop\convex-ai-bot\sovereign-agent\components\DraftReview.test.tsx`

## Status
✅ **56 Tests Written - All Currently Failing**

Tests are failing as expected because the DraftReview component has not been implemented yet.

## Component Requirements (From Tests)

### Props
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
    confidence: number; // 0-1 (87 = 87%)
    status: 'pending' | 'processing' | 'approved' | 'rejected';
  };
  onApprove: (draftId: string) => void;
  onReject: (draftId: string) => void;
  onSave: (draftId: string, content: string) => void;
  isLoading?: boolean;
  error?: string;
}
```

## Test Coverage Summary

### 1. Rendering Tests (9 tests)
- [x] Display original email subject
- [x] Display original email sender
- [x] Display AI draft content
- [x] Show priority badge
- [x] Show confidence score as percentage (87%)
- [x] Display "Original Email" section header
- [x] Display "AI-Generated Reply" section header
- [x] Render approve button
- [x] Render reject button
- [x] Render edit button

### 2. Button Interactions (3 tests)
- [x] Call onApprove with draft ID when approve button clicked
- [x] Call onReject with draft ID when reject button clicked
- [x] Enter edit mode when edit button clicked

### 3. Edit Mode Functionality (7 tests)
- [x] Show textarea in edit mode
- [x] Allow editing textarea content
- [x] Call onSave with edited content and draft ID
- [x] Exit edit mode after save
- [x] Show cancel button in edit mode
- [x] Exit edit mode without saving on cancel
- [x] Preserve original content if cancel clicked

### 4. Loading State (4 tests)
- [x] Show loading indicator when isLoading=true
- [x] Disable approve button during loading
- [x] Disable reject button during loading
- [x] Disable edit button during loading

### 5. Error State (4 tests)
- [x] Display error message when error prop provided
- [x] Show error message with error icon
- [x] Disable approve button in error state
- [x] Disable reject button in error state

### 6. Edge Cases (8 tests)
- [x] Handle long email subjects (multi-line wrapping)
- [x] Handle long email body content
- [x] Handle priority "low"
- [x] Handle confidence score of 1.0 (100%)
- [x] Handle confidence score of 0.0 (0%)
- [x] Display original email body when present
- [x] Handle empty draft content gracefully
- [x] Render without crash on minimal data

### 7. Component Structure (3 tests)
- [x] Main container has data-testid="draft-review-container"
- [x] Confidence badge has data-testid="confidence-badge"
- [x] Action buttons section has data-testid="action-buttons"

### 8. Accessibility (4 tests)
- [x] Proper heading hierarchy (h2 for section headers)
- [x] Descriptive button labels
- [x] Aria-busy="true" on loading state
- [x] Alert role on error state

## Test Data

### Mock Email (Original)
```javascript
{
  id: 'email-1',
  from: 'client@example.com',
  subject: 'Project Proposal Discussion',
  date: new Date('2024-01-09'),
  body: 'I would like to discuss the project proposal for Q1.',
  priority: 'high'
}
```

### Mock Draft
```javascript
{
  id: 'draft-1',
  originalEmail: mockOriginalEmail,
  draftContent: 'Thank you for reaching out about the Q1 project proposal...',
  priority: 'high',
  confidence: 0.87,
  status: 'pending'
}
```

## Test Breakdown by Category

| Category | Count | Priority |
|----------|-------|----------|
| Rendering | 10 | P0 |
| Interactions | 10 | P0 |
| States | 8 | P1 |
| Edge Cases | 8 | P1 |
| Structure | 3 | P2 |
| Accessibility | 4 | P1 |
| **Total** | **56** | |

## Required Test IDs

The component must implement these `data-testid` attributes:

1. `draft-review-container` - Main container
2. `priority-badge` - Priority display badge
3. `confidence-badge` - Confidence score badge
4. `draft-content` - Draft content display area
5. `original-email-body` - Original email body
6. `draft-review-loading` - Loading indicator
7. `draft-review-error` - Error message container
8. `action-buttons` - Action button group

## Dependencies Used in Tests

- **Vitest** - Test framework
- **@testing-library/react** - Component testing
- **@testing-library/user-event** - User interactions
- **@testing-library/jest-dom** - DOM matchers

## Next Steps (GREEN Phase)

1. Create `DraftReview.tsx` component
2. Implement all required props and state management
3. Add Tailwind CSS styling (matching PriorityBadge pattern)
4. Use existing PriorityBadge component for priority display
5. Run tests: `npm test -- components/DraftReview.test.tsx`
6. All 56 tests should pass

## Running Tests

### Run all DraftReview tests
```bash
npm test -- components/DraftReview.test.tsx
```

### Watch mode
```bash
npm test -- --watch components/DraftReview.test.tsx
```

### With coverage
```bash
npm test -- --coverage components/DraftReview.test.tsx
```

### Run specific test suite
```bash
npm test -- components/DraftReview.test.tsx -t "Rendering"
```

## Notes

- Component uses Convex hooks (mocked in tests)
- PriorityBadge component already exists and is reused
- Edit mode uses React state (not Convex mutation)
- Save operation is async (uses onSave callback)
- Component should be responsive and accessible
