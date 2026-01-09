import { describe, it, expect } from "vitest";
import {
  trackApproval,
  trackRejection,
  calculateAccuracyMetrics,
  extractEditPatterns,
} from "./feedback-tracker";

/**
 * Test suite for feedback tracking system on AI-generated drafts
 * These tests are designed to FAIL until the feedback-tracker module is implemented
 * Following TDD RED phase: tests define the expected behavior before implementation
 */

describe("Feedback Tracker - trackApproval", () => {
  describe("Basic approval tracking", () => {
    it("should return an approval event object with correct structure", () => {
      const draft = {
        id: "draft-001",
        content: "This is a sample email draft",
        generatedAt: new Date("2025-01-09T10:00:00Z"),
        priority: "normal",
        model: "gpt-4",
      };

      const result = trackApproval(draft, false);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("eventType");
      expect(result.eventType).toBe("approval");
      expect(result).toHaveProperty("draftId");
      expect(result.draftId).toBe("draft-001");
      expect(result).toHaveProperty("wasEdited");
      expect(result.wasEdited).toBe(false);
    });

    it("should calculate timeToApproval in milliseconds", () => {
      const generatedAt = new Date();

      const draft = {
        id: "draft-002",
        content: "Email response",
        generatedAt,
        priority: "normal",
        model: "gpt-4",
      };

      const result = trackApproval(draft, false);

      expect(result).toHaveProperty("timeToApproval");
      expect(result.timeToApproval).toBeGreaterThanOrEqual(0);
      // Should be a small positive number (few milliseconds)
      expect(result.timeToApproval).toBeLessThanOrEqual(5000);
      expect(typeof result.timeToApproval).toBe("number");
    });

    it("should flag when draft was edited before approval", () => {
      const draft = {
        id: "draft-003",
        content: "Original draft",
        generatedAt: new Date(),
        priority: "normal",
        model: "gpt-4",
      };

      const resultNotEdited = trackApproval(draft, false);
      const resultEdited = trackApproval(draft, true);

      expect(resultNotEdited.wasEdited).toBe(false);
      expect(resultEdited.wasEdited).toBe(true);
    });

    it("should include timestamp of approval", () => {
      const draft = {
        id: "draft-004",
        content: "Test email",
        generatedAt: new Date("2025-01-09T10:00:00Z"),
        priority: "normal",
        model: "gpt-4",
      };

      const before = new Date();
      const result = trackApproval(draft, false);
      const after = new Date();

      expect(result).toHaveProperty("approvedAt");
      expect(result.approvedAt).toBeInstanceOf(Date);
      expect(result.approvedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.approvedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should preserve draft metadata in approval event", () => {
      const draft = {
        id: "draft-005",
        content: "Important email",
        generatedAt: new Date(),
        priority: "urgent",
        model: "gpt-4-turbo",
      };

      const result = trackApproval(draft, false);

      expect(result).toHaveProperty("priority");
      expect(result.priority).toBe("urgent");
      expect(result).toHaveProperty("model");
      expect(result.model).toBe("gpt-4-turbo");
    });
  });
});

describe("Feedback Tracker - trackRejection", () => {
  describe("Basic rejection tracking", () => {
    it("should return a rejection event object with correct structure", () => {
      const draft = {
        id: "draft-001",
        content: "Rejected draft",
        generatedAt: new Date(),
        priority: "normal",
        model: "gpt-4",
      };

      const result = trackRejection(draft, "Tone too formal");

      expect(result).toBeDefined();
      expect(result).toHaveProperty("eventType");
      expect(result.eventType).toBe("rejection");
      expect(result).toHaveProperty("draftId");
      expect(result.draftId).toBe("draft-001");
    });

    it("should include rejection reason in event", () => {
      const draft = {
        id: "draft-002",
        content: "Bad draft",
        generatedAt: new Date(),
        priority: "normal",
        model: "gpt-4",
      };

      const reasons = [
        "Tone too formal",
        "Too verbose",
        "Missing context",
        "Grammatically incorrect",
      ];

      for (const reason of reasons) {
        const result = trackRejection(draft, reason);

        expect(result).toHaveProperty("reason");
        expect(result.reason).toBe(reason);
      }
    });

    it("should categorize rejection type based on reason", () => {
      const draft = {
        id: "draft-003",
        content: "Test",
        generatedAt: new Date(),
        priority: "normal",
        model: "gpt-4",
      };

      // Test tone-related rejection
      const toneRejection = trackRejection(draft, "Tone is too casual");
      expect(toneRejection).toHaveProperty("rejectionType");
      expect(["tone", "content", "grammar", "other"]).toContain(
        toneRejection.rejectionType
      );

      // Test content-related rejection
      const contentRejection = trackRejection(draft, "Missing important details");
      expect(contentRejection).toHaveProperty("rejectionType");
      expect(["tone", "content", "grammar", "other"]).toContain(
        contentRejection.rejectionType
      );

      // Test grammar rejection
      const grammarRejection = trackRejection(draft, "Spelling error");
      expect(grammarRejection).toHaveProperty("rejectionType");
      expect(["tone", "content", "grammar", "other"]).toContain(
        grammarRejection.rejectionType
      );
    });

    it("should include timestamp of rejection", () => {
      const draft = {
        id: "draft-004",
        content: "Test",
        generatedAt: new Date("2025-01-09T10:00:00Z"),
        priority: "normal",
        model: "gpt-4",
      };

      const before = new Date();
      const result = trackRejection(draft, "Test reason");
      const after = new Date();

      expect(result).toHaveProperty("rejectedAt");
      expect(result.rejectedAt).toBeInstanceOf(Date);
      expect(result.rejectedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.rejectedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should preserve draft metadata in rejection event", () => {
      const draft = {
        id: "draft-005",
        content: "Important",
        generatedAt: new Date(),
        priority: "urgent",
        model: "gpt-4-turbo",
      };

      const result = trackRejection(draft, "Wrong tone");

      expect(result).toHaveProperty("priority");
      expect(result.priority).toBe("urgent");
      expect(result).toHaveProperty("model");
      expect(result.model).toBe("gpt-4-turbo");
    });
  });
});

describe("Feedback Tracker - calculateAccuracyMetrics", () => {
  describe("Metric calculations from events", () => {
    it("should calculate percentage of approvals as-is (without edits)", () => {
      const events = [
        {
          eventType: "approval" as const,
          draftId: "d1",
          wasEdited: false,
          priority: "normal",
          model: "gpt-4",
        },
        {
          eventType: "approval" as const,
          draftId: "d2",
          wasEdited: false,
          priority: "normal",
          model: "gpt-4",
        },
        {
          eventType: "approval" as const,
          draftId: "d3",
          wasEdited: true,
          priority: "normal",
          model: "gpt-4",
        },
      ];

      const metrics = calculateAccuracyMetrics(events);

      expect(metrics).toHaveProperty("approvedAsIs");
      expect(metrics.approvedAsIs).toBe(66.67); // 2 out of 3 = 66.67%
    });

    it("should calculate percentage of approvals with edits", () => {
      const events = [
        {
          eventType: "approval" as const,
          draftId: "d1",
          wasEdited: true,
          priority: "normal",
          model: "gpt-4",
        },
        {
          eventType: "approval" as const,
          draftId: "d2",
          wasEdited: false,
          priority: "normal",
          model: "gpt-4",
        },
        {
          eventType: "approval" as const,
          draftId: "d3",
          wasEdited: true,
          priority: "normal",
          model: "gpt-4",
        },
      ];

      const metrics = calculateAccuracyMetrics(events);

      expect(metrics).toHaveProperty("approvedWithEdits");
      expect(metrics.approvedWithEdits).toBe(66.67); // 2 out of 3 = 66.67%
    });

    it("should calculate percentage of rejections", () => {
      const events = [
        {
          eventType: "approval" as const,
          draftId: "d1",
          wasEdited: false,
          priority: "normal",
          model: "gpt-4",
        },
        {
          eventType: "approval" as const,
          draftId: "d2",
          wasEdited: false,
          priority: "normal",
          model: "gpt-4",
        },
        {
          eventType: "rejection" as const,
          draftId: "d3",
          rejectionType: "tone",
          priority: "normal",
          model: "gpt-4",
        },
        {
          eventType: "rejection" as const,
          draftId: "d4",
          rejectionType: "content",
          priority: "normal",
          model: "gpt-4",
        },
      ];

      const metrics = calculateAccuracyMetrics(events);

      expect(metrics).toHaveProperty("rejectionRate");
      expect(metrics.rejectionRate).toBe(50); // 2 out of 4 = 50%
    });

    it("should group metrics by priority level", () => {
      const events = [
        {
          eventType: "approval" as const,
          draftId: "d1",
          wasEdited: false,
          priority: "urgent",
          model: "gpt-4",
        },
        {
          eventType: "approval" as const,
          draftId: "d2",
          wasEdited: true,
          priority: "urgent",
          model: "gpt-4",
        },
        {
          eventType: "approval" as const,
          draftId: "d3",
          wasEdited: false,
          priority: "normal",
          model: "gpt-4",
        },
        {
          eventType: "rejection" as const,
          draftId: "d4",
          rejectionType: "tone",
          priority: "normal",
          model: "gpt-4",
        },
      ];

      const metrics = calculateAccuracyMetrics(events);

      expect(metrics).toHaveProperty("byPriority");
      expect(metrics.byPriority).toHaveProperty("urgent");
      expect(metrics.byPriority).toHaveProperty("normal");

      // Urgent: 2 approvals out of 2 = 100% accuracy
      expect(metrics.byPriority.urgent).toHaveProperty("approvalRate");
      expect(metrics.byPriority.urgent.approvalRate).toBe(100);

      // Normal: 1 approval out of 2 = 50% accuracy
      expect(metrics.byPriority.normal).toHaveProperty("approvalRate");
      expect(metrics.byPriority.normal.approvalRate).toBe(50);
    });

    it("should return zero percentages for empty events array", () => {
      const events: any[] = [];

      const metrics = calculateAccuracyMetrics(events);

      expect(metrics).toHaveProperty("approvedAsIs");
      expect(metrics.approvedAsIs).toBe(0);
      expect(metrics).toHaveProperty("approvedWithEdits");
      expect(metrics.approvedWithEdits).toBe(0);
      expect(metrics).toHaveProperty("rejectionRate");
      expect(metrics.rejectionRate).toBe(0);
    });

    it("should handle single event correctly", () => {
      const events = [
        {
          eventType: "approval" as const,
          draftId: "d1",
          wasEdited: false,
          priority: "normal",
          model: "gpt-4",
        },
      ];

      const metrics = calculateAccuracyMetrics(events);

      expect(metrics.approvedAsIs).toBe(100);
      expect(metrics.approvedWithEdits).toBe(0);
      expect(metrics.rejectionRate).toBe(0);
    });
  });
});

describe("Feedback Tracker - extractEditPatterns", () => {
  describe("Pattern extraction from edits", () => {
    it("should detect word count changes between original and edited text", () => {
      const original = "This is a test email with some words.";
      const edited = "This is a test email with many additional words included.";

      const patterns = extractEditPatterns(original, edited);

      expect(patterns).toBeDefined();
      expect(patterns).toHaveProperty("wordCountChange");
      expect(patterns.wordCountChange).toBeGreaterThan(0); // edited is longer
      expect(typeof patterns.wordCountChange).toBe("number");
    });

    it("should detect when edited version is shorter", () => {
      const original = "This is a much longer test email with many words.";
      const edited = "Short email.";

      const patterns = extractEditPatterns(original, edited);

      expect(patterns).toHaveProperty("wordCountChange");
      expect(patterns.wordCountChange).toBeLessThan(0); // edited is shorter
    });

    it("should detect tone changes toward formality", () => {
      const original = "hey there, just wanted to reach out about this thing";
      const edited = "I would like to formally discuss this matter with you.";

      const patterns = extractEditPatterns(original, edited);

      expect(patterns).toHaveProperty("toneChange");
      expect(patterns.toneChange).toBeDefined();
      expect(["more_formal", "more_casual", "neutral"]).toContain(
        patterns.toneChange
      );
    });

    it("should detect tone changes toward casualness", () => {
      const original =
        "Pursuant to our discussion, I would like to address this matter.";
      const edited = "Hey! Quick question about this stuff.";

      const patterns = extractEditPatterns(original, edited);

      expect(patterns).toHaveProperty("toneChange");
      expect(["more_formal", "more_casual", "neutral"]).toContain(
        patterns.toneChange
      );
    });

    it("should return neutral tone when no obvious change", () => {
      const original = "The project is on schedule.";
      const edited = "The project remains on schedule.";

      const patterns = extractEditPatterns(original, edited);

      expect(patterns).toHaveProperty("toneChange");
      expect(patterns.toneChange).toBe("neutral");
    });

    it("should return a diff summary showing key changes", () => {
      const original = "Original email content";
      const edited = "Modified email content with additions";

      const patterns = extractEditPatterns(original, edited);

      expect(patterns).toHaveProperty("diffSummary");
      expect(typeof patterns.diffSummary).toBe("string");
      expect(patterns.diffSummary.length).toBeGreaterThan(0);
    });

    it("should detect if content was completely rewritten", () => {
      const original = "Complete rewrite test";
      const edited = "Entirely different content";

      const patterns = extractEditPatterns(original, edited);

      expect(patterns).toHaveProperty("similarityScore");
      expect(patterns.similarityScore).toBeGreaterThanOrEqual(0);
      expect(patterns.similarityScore).toBeLessThanOrEqual(100);
    });

    it("should detect punctuation and capitalization changes", () => {
      const original = "Hey, can you help me?";
      const edited = "Could you please provide assistance?";

      const patterns = extractEditPatterns(original, edited);

      expect(patterns).toBeDefined();
      expect(patterns).toHaveProperty("wordCountChange");
      expect(patterns).toHaveProperty("toneChange");
    });

    it("should return similarity score of 100 for identical texts", () => {
      const text = "Identical text";

      const patterns = extractEditPatterns(text, text);

      expect(patterns.similarityScore).toBe(100);
    });

    it("should return similarity score of 0 for completely different texts", () => {
      const original = "aaaaa bbbbb";
      const edited = "xxxxx yyyyy";

      const patterns = extractEditPatterns(original, edited);

      expect(patterns.similarityScore).toBeLessThan(50); // significantly different
    });
  });
});
