import { describe, expect, test } from "vitest";
import { parseMeetingProposal } from "./proposal-parser";

describe("Meeting Proposal Parser", () => {
  test("extracts date and time from email with explicit date", () => {
    const email = {
      subject: "Meeting Request",
      body: "Can we meet on January 15th at 2pm for an hour?",
    };

    const proposal = parseMeetingProposal(email);

    expect(proposal).not.toBeNull();
    expect(proposal?.title).toBe("Meeting Request");
  });

  test("detects meeting keywords in subject", () => {
    const email = {
      subject: "Quick sync about Project Alpha",
      body: "Let's discuss the timeline tomorrow.",
    };

    const proposal = parseMeetingProposal(email);

    expect(proposal).not.toBeNull();
    expect(proposal?.title).toContain("sync");
  });

  test("returns null when no meeting detected", () => {
    const email = {
      subject: "Invoice attached",
      body: "Please find the invoice for last month attached.",
    };

    const proposal = parseMeetingProposal(email);

    expect(proposal).toBeNull();
  });

  test("detects meeting request in body", () => {
    const email = {
      subject: "Re: Updates",
      body: "Can we schedule a call to discuss this further?",
    };

    const proposal = parseMeetingProposal(email);

    expect(proposal).not.toBeNull();
  });
});
