import { describe, expect, test } from "vitest";
import type { Contact, InteractionSummary, ContactContext } from "./contact";

describe("Contact Types", () => {
  test("Contact has required fields", () => {
    const contact: Contact = {
      email: "john@company.com",
      name: "John Smith",
      company: "Acme Corp",
      role: "Product Manager",
      lastInteraction: new Date(),
      interactionCount: 15,
    };

    expect(contact.email).toBe("john@company.com");
    expect(contact.interactionCount).toBe(15);
  });

  test("InteractionSummary tracks email patterns", () => {
    const summary: InteractionSummary = {
      totalEmails: 50,
      sentByMe: 20,
      receivedFromThem: 30,
      avgResponseTimeHours: 4.5,
      commonTopics: ["project updates", "meetings", "reviews"],
    };

    expect(summary.commonTopics).toContain("meetings");
  });

  test("ContactContext combines contact and history", () => {
    const context: ContactContext = {
      contact: {
        email: "jane@client.com",
        name: "Jane Doe",
        lastInteraction: new Date(),
        interactionCount: 10,
      },
      interactions: {
        totalEmails: 10,
        sentByMe: 5,
        receivedFromThem: 5,
        avgResponseTimeHours: 2,
        commonTopics: ["contracts"],
      },
      recentThreads: [],
    };

    expect(context.contact.name).toBe("Jane Doe");
  });
});
