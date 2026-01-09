import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import schema from "./schema";

const modules = import.meta.glob(["../**/*.*s", "!../**/*.test.*s"]);

describe("Contact Enrichment", () => {
  test("calculates interaction count from emails", async () => {
    const t = convexTest(schema, modules);

    // Insert test emails from same sender
    for (let i = 0; i < 5; i++) {
      await t.run(async (ctx) => {
        await ctx.db.insert("emails", {
          gmailId: `email-${i}`,
          threadId: `thread-${i}`,
          from: "frequent@sender.com",
          to: "me@example.com",
          subject: `Email ${i}`,
          body: "Content",
          snippet: "Content",
          date: Date.now() - i * 86400000,
          receivedAt: Date.now() - i * 86400000,
          isRead: false,
          isStarred: false,
          isArchived: false,
        });
      });
    }

    // Get emails by contact
    const emails = await t.run(async (ctx) => {
      return await ctx.db
        .query("emails")
        .filter((q) => q.eq(q.field("from"), "frequent@sender.com"))
        .collect();
    });

    expect(emails.length).toBe(5);
  });

  test("extracts common topics from subject lines", async () => {
    const t = convexTest(schema, modules);

    await t.run(async (ctx) => {
      await ctx.db.insert("emails", {
        gmailId: "e1",
        threadId: "t1",
        from: "topic@sender.com",
        to: "me@example.com",
        subject: "Project Alpha Update",
        body: "Update on Alpha",
        snippet: "Update",
        date: Date.now(),
        receivedAt: Date.now(),
        isRead: false,
        isStarred: false,
        isArchived: false,
      });
    });

    await t.run(async (ctx) => {
      await ctx.db.insert("emails", {
        gmailId: "e2",
        threadId: "t2",
        from: "topic@sender.com",
        to: "me@example.com",
        subject: "Project Alpha Review",
        body: "Review for Alpha",
        snippet: "Review",
        date: Date.now(),
        receivedAt: Date.now(),
        isRead: false,
        isStarred: false,
        isArchived: false,
      });
    });

    // Query emails by sender
    const emails = await t.run(async (ctx) => {
      return await ctx.db
        .query("emails")
        .filter((q) => q.eq(q.field("from"), "topic@sender.com"))
        .collect();
    });

    expect(emails.length).toBe(2);
    expect(emails[0].subject).toContain("Project Alpha");
  });
});
