/**
 * Feedback Tracker Module
 *
 * Tracks user feedback (approvals/rejections) on AI-generated drafts
 * and calculates accuracy metrics for the generation system.
 *
 * This module is in the RED phase of TDD - tests are defined but implementation is pending.
 */

// Types for feedback events
interface Draft {
  id: string;
  content: string;
  generatedAt: Date;
  priority: "urgent" | "normal" | "low-priority";
  model: string;
}

interface ApprovalEvent {
  eventType: "approval";
  draftId: string;
  wasEdited: boolean;
  timeToApproval: number;
  approvedAt: Date;
  priority: Draft["priority"];
  model: string;
}

interface RejectionEvent {
  eventType: "rejection";
  draftId: string;
  reason: string;
  rejectionType: "tone" | "content" | "grammar" | "other";
  rejectedAt: Date;
  priority: Draft["priority"];
  model: string;
}

type FeedbackEvent = ApprovalEvent | RejectionEvent;

interface AccuracyMetrics {
  approvedAsIs: number;
  approvedWithEdits: number;
  rejectionRate: number;
  byPriority: Record<
    string,
    {
      approvalRate: number;
      count: number;
    }
  >;
}

interface EditPatterns {
  wordCountChange: number;
  toneChange: "more_formal" | "more_casual" | "neutral";
  diffSummary: string;
  similarityScore: number;
}

/**
 * Track approval of a draft
 *
 * @param draft The draft that was approved
 * @param wasEdited Whether the user made edits before approving
 * @returns ApprovalEvent object
 */
export function trackApproval(draft: Draft, wasEdited: boolean): ApprovalEvent {
  const approvedAt = new Date();
  const timeToApproval = approvedAt.getTime() - draft.generatedAt.getTime();

  return {
    eventType: "approval",
    draftId: draft.id,
    wasEdited,
    timeToApproval,
    approvedAt,
    priority: draft.priority,
    model: draft.model,
  };
}

/**
 * Track rejection of a draft
 *
 * @param draft The draft that was rejected
 * @param reason User's reason for rejection
 * @returns RejectionEvent object
 */
export function trackRejection(
  draft: Draft,
  reason: string
): RejectionEvent {
  const rejectionType = categorizeRejectionReason(reason);

  return {
    eventType: "rejection",
    draftId: draft.id,
    reason,
    rejectionType,
    rejectedAt: new Date(),
    priority: draft.priority,
    model: draft.model,
  };
}

function categorizeRejectionReason(
  reason: string
): "tone" | "content" | "grammar" | "other" {
  const lowerReason = reason.toLowerCase();

  if (
    lowerReason.includes("tone") ||
    lowerReason.includes("formal") ||
    lowerReason.includes("casual")
  ) {
    return "tone";
  }

  if (
    lowerReason.includes("grammar") ||
    lowerReason.includes("spelling") ||
    lowerReason.includes("error")
  ) {
    return "grammar";
  }

  if (
    lowerReason.includes("content") ||
    lowerReason.includes("details") ||
    lowerReason.includes("context")
  ) {
    return "content";
  }

  return "other";
}

/**
 * Calculate accuracy metrics from feedback events
 *
 * @param events Array of approval/rejection events
 * @returns AccuracyMetrics with percentages and breakdowns
 */
export function calculateAccuracyMetrics(
  events: FeedbackEvent[]
): AccuracyMetrics {
  if (events.length === 0) {
    return {
      approvedAsIs: 0,
      approvedWithEdits: 0,
      rejectionRate: 0,
      byPriority: {},
    };
  }

  const approvedAsIsCount = events.filter(
    (e) => e.eventType === "approval" && !e.wasEdited
  ).length;

  const approvedWithEditsCount = events.filter(
    (e) => e.eventType === "approval" && e.wasEdited
  ).length;

  const rejectionCount = events.filter(
    (e) => e.eventType === "rejection"
  ).length;

  const byPriority: Record<string, { approvalRate: number; count: number }> =
    {};

  const priorityGroups: Record<string, { approvals: number; total: number }> =
    {};

  for (const event of events) {
    if (!priorityGroups[event.priority]) {
      priorityGroups[event.priority] = { approvals: 0, total: 0 };
    }
    priorityGroups[event.priority].total += 1;
    if (event.eventType === "approval") {
      priorityGroups[event.priority].approvals += 1;
    }
  }

  for (const [priority, data] of Object.entries(priorityGroups)) {
    const approvalRate = (data.approvals / data.total) * 100;
    byPriority[priority] = {
      approvalRate: Math.round(approvalRate * 100) / 100,
      count: data.total,
    };
  }

  return {
    approvedAsIs: Math.round((approvedAsIsCount / events.length) * 10000) / 100,
    approvedWithEdits:
      Math.round((approvedWithEditsCount / events.length) * 10000) / 100,
    rejectionRate: Math.round((rejectionCount / events.length) * 10000) / 100,
    byPriority,
  };
}

/**
 * Extract patterns from edited drafts
 *
 * @param original Original draft text
 * @param edited Edited draft text
 * @returns EditPatterns showing word count, tone, similarity, etc.
 */
export function extractEditPatterns(
  original: string,
  edited: string
): EditPatterns {
  const originalWords = original.trim().split(/\s+/);
  const editedWords = edited.trim().split(/\s+/);
  const wordCountChange = editedWords.length - originalWords.length;

  const toneChange = detectToneChange(original, edited);
  const diffSummary = generateDiffSummary(original, edited);
  const similarityScore = calculateSimilarity(original, edited);

  return {
    wordCountChange,
    toneChange,
    diffSummary,
    similarityScore,
  };
}

function detectToneChange(
  original: string,
  edited: string
): "more_formal" | "more_casual" | "neutral" {
  const formalWords = [
    "formal",
    "formally",
    "pursuant",
    "address",
    "matter",
    "discuss",
    "would like",
  ];
  const casualWords = [
    "hey",
    "casual",
    "stuff",
    "thing",
    "reach out",
    "quick",
    "thanks",
  ];

  const originalLower = original.toLowerCase();
  const editedLower = edited.toLowerCase();

  const originalFormalCount = formalWords.filter((w) =>
    originalLower.includes(w)
  ).length;
  const editedFormalCount = formalWords.filter((w) =>
    editedLower.includes(w)
  ).length;

  const originalCasualCount = casualWords.filter((w) =>
    originalLower.includes(w)
  ).length;
  const editedCasualCount = casualWords.filter((w) =>
    editedLower.includes(w)
  ).length;

  const formalShift = editedFormalCount - originalFormalCount;
  const casualShift = editedCasualCount - originalCasualCount;

  if (formalShift > 0) {
    return "more_formal";
  } else if (casualShift > 0) {
    return "more_casual";
  }
  return "neutral";
}

function generateDiffSummary(original: string, edited: string): string {
  const originalWords = original.split(/\s+/);
  const editedWords = edited.split(/\s+/);

  const added = editedWords.length - originalWords.length;
  const removed = originalWords.length - editedWords.length;

  if (added > 0) {
    return `Added ${added} words`;
  } else if (removed > 0) {
    return `Removed ${removed} words`;
  }
  return "Text modified";
}

function calculateSimilarity(original: string, edited: string): number {
  if (original === edited) {
    return 100;
  }

  const originalWords = new Set(original.toLowerCase().split(/\s+/));
  const editedWords = new Set(edited.toLowerCase().split(/\s+/));

  const intersection = new Set(
    [...originalWords].filter((w) => editedWords.has(w))
  );
  const union = new Set([...originalWords, ...editedWords]);

  const jaccardIndex = intersection.size / union.size;
  return Math.round(jaccardIndex * 100);
}

export type {
  Draft,
  ApprovalEvent,
  RejectionEvent,
  FeedbackEvent,
  AccuracyMetrics,
  EditPatterns,
};
