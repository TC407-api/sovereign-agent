import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import schema from "./schema";
import { insertEmail, listEmails, getEmail, updateEmail } from "./emails";

describe("Email Mutations and Queries", () => {
  test("inserts email into database", async () => {
    const t = convexTest(schema);

    const emailId = await t.mutation(insertEmail, {
      gmailId: "test-123",
      threadId: "thread-123",
      from: "test@example.com",
      to: "you@example.com",
      subject: "Test Email",
      body: "This is a test",
      snippet: "This is a test",
      date: Date.now(),
      receivedAt: Date.now(),
      isRead: false,
      isStarred: false,
      isArchived: false,
    });

    expect(emailId).toBeDefined();

    const email = await t.run(async (ctx) => {
      return await ctx.db.get(emailId);
    });

    expect(email).toBeDefined();
    expect(email!.from).toBe("test@example.com");
  });

  test("deduplicates emails by gmailId", async () => {
    const t = convexTest(schema);

    const emailData = {
      gmailId: "duplicate-123",
      threadId: "thread-123",
      from: "test@example.com",
      to: "you@example.com",
      subject: "Test Email",
      body: "This is a test",
      snippet: "This is a test",
      date: Date.now(),
      receivedAt: Date.now(),
      isRead: false,
      isStarred: false,
      isArchived: false,
    };

    const firstId = await t.mutation(insertEmail, emailData);
    const secondId = await t.mutation(insertEmail, emailData);

    expect(firstId).toBe(secondId);
  });

  test("queries emails sorted by date descending", async () => {
    const t = convexTest(schema);

    // Insert test emails
    await t.mutation(insertEmail, {
      gmailId: "old-email",
      threadId: "thread-1",
      from: "old@test.com",
      to: "you@test.com",
      subject: "Old Email",
      body: "Old content",
      snippet: "Old content",
      date: Date.now() - 86400000, // Yesterday
      receivedAt: Date.now() - 86400000,
      isRead: false,
      isStarred: false,
      isArchived: false,
    });

    await t.mutation(insertEmail, {
      gmailId: "new-email",
      threadId: "thread-2",
      from: "new@test.com",
      to: "you@test.com",
      subject: "New Email",
      body: "New content",
      snippet: "New content",
      date: Date.now(),
      receivedAt: Date.now(),
      isRead: false,
      isStarred: false,
      isArchived: false,
    });

    const emails = await t.query(listEmails, {});

    expect(emails).toHaveLength(2);
    expect(emails[0].subject).toBe("New Email");
    expect(emails[1].subject).toBe("Old Email");
  });

  test("gets single email by ID", async () => {
    const t = convexTest(schema);

    const emailId = await t.mutation(insertEmail, {
      gmailId: "test-456",
      threadId: "thread-456",
      from: "sender@test.com",
      to: "you@test.com",
      subject: "Specific Email",
      body: "This is a specific email body",
      snippet: "This is a specific",
      date: Date.now(),
      receivedAt: Date.now(),
      isRead: false,
      isStarred: false,
      isArchived: false,
    });

    const email = await t.query(getEmail, { id: emailId });

    expect(email).toBeDefined();
    expect(email!.subject).toBe("Specific Email");
    expect(email!.body).toBe("This is a specific email body");
  });

  test("marks email as read", async () => {
    const t = convexTest(schema);

    const emailId = await t.mutation(insertEmail, {
      gmailId: "unread-email",
      threadId: "thread-789",
      from: "sender@test.com",
      to: "you@test.com",
      subject: "Unread Email",
      body: "Content",
      snippet: "Content",
      date: Date.now(),
      receivedAt: Date.now(),
      isRead: false,
      isStarred: false,
      isArchived: false,
    });

    await t.mutation(updateEmail, {
      id: emailId,
      isRead: true,
    });

    const email = await t.query(getEmail, { id: emailId });

    expect(email!.isRead).toBe(true);
  });

  test("stars and archives email", async () => {
    const t = convexTest(schema);

    const emailId = await t.mutation(insertEmail, {
      gmailId: "star-archive-email",
      threadId: "thread-999",
      from: "sender@test.com",
      to: "you@test.com",
      subject: "Star Me",
      body: "Content",
      snippet: "Content",
      date: Date.now(),
      receivedAt: Date.now(),
      isRead: false,
      isStarred: false,
      isArchived: false,
    });

    await t.mutation(updateEmail, {
      id: emailId,
      isStarred: true,
      isArchived: true,
    });

    const email = await t.query(getEmail, { id: emailId });

    expect(email!.isStarred).toBe(true);
    expect(email!.isArchived).toBe(true);
  });
});
