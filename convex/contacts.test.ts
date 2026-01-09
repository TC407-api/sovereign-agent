import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import schema from "./schema";

const modules = import.meta.glob(["../**/*.*s", "!../**/*.test.*s"]);

describe("Contacts Schema", () => {
  test("can upsert a contact", async () => {
    const t = convexTest(schema, modules);

    await t.run(async (ctx) => {
      await ctx.db.insert("contacts", {
        email: "john@company.com",
        name: "John Smith",
        company: "Acme Corp",
        role: "Engineer",
        avatarUrl: undefined,
        lastInteraction: Date.now(),
        interactionCount: 1,
        commonTopics: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    const contact = await t.run(async (ctx) => {
      return await ctx.db
        .query("contacts")
        .withIndex("by_email", (q) => q.eq("email", "john@company.com"))
        .first();
    });

    expect(contact?.name).toBe("John Smith");
    expect(contact?.company).toBe("Acme Corp");
  });

  test("updates existing contact on upsert", async () => {
    const t = convexTest(schema, modules);

    // Insert initial contact
    await t.run(async (ctx) => {
      await ctx.db.insert("contacts", {
        email: "john@company.com",
        name: "John Smith",
        company: "Old Company",
        role: "Engineer",
        avatarUrl: undefined,
        lastInteraction: Date.now(),
        interactionCount: 1,
        commonTopics: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    // Update the contact
    const existing = await t.run(async (ctx) => {
      return await ctx.db
        .query("contacts")
        .withIndex("by_email", (q) => q.eq("email", "john@company.com"))
        .first();
    });

    if (existing) {
      await t.run(async (ctx) => {
        await ctx.db.patch(existing._id, {
          company: "New Company",
          updatedAt: Date.now(),
        });
      });
    }

    const contact = await t.run(async (ctx) => {
      return await ctx.db
        .query("contacts")
        .withIndex("by_email", (q) => q.eq("email", "john@company.com"))
        .first();
    });

    expect(contact?.company).toBe("New Company");
  });
});
