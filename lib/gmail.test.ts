import { describe, test, expect, vi, beforeEach } from "vitest";

// Create mock functions at module level so tests can access them
const mockList = vi.fn();
const mockGet = vi.fn();
const mockSend = vi.fn();
const mockDraftCreate = vi.fn();

// Mock googleapis before importing GmailService
vi.mock("googleapis", () => {
  // Create a proper class for OAuth2
  class MockOAuth2 {
    setCredentials = vi.fn();
  }

  return {
    google: {
      auth: {
        OAuth2: MockOAuth2,
      },
      gmail: vi.fn(() => ({
        users: {
          messages: {
            list: mockList,
            get: mockGet,
            send: mockSend,
          },
          drafts: {
            create: mockDraftCreate,
          },
        },
      })),
    },
  };
});

// Import after mocking
import { GmailService } from "./gmail";

describe("GmailService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mock responses
    mockList.mockResolvedValue({
      data: {
        messages: [
          { id: "msg-1", threadId: "thread-1" },
          { id: "msg-2", threadId: "thread-2" },
        ],
        nextPageToken: null,
      },
    });

    mockGet.mockResolvedValue({
      data: {
        id: "msg-1",
        threadId: "thread-1",
        payload: {
          headers: [
            { name: "From", value: "sender@example.com" },
            { name: "To", value: "you@example.com" },
            { name: "Subject", value: "Test Subject" },
            { name: "Date", value: "Mon, 06 Jan 2026 10:00:00 GMT" },
          ],
          body: { data: Buffer.from("Hello World").toString("base64") },
        },
        snippet: "Hello World",
      },
    });

    mockSend.mockResolvedValue({
      data: {
        id: "sent-msg-1",
        threadId: "thread-1",
      },
    });

    mockDraftCreate.mockResolvedValue({
      data: {
        id: "draft-1",
        message: {
          id: "draft-msg-1",
        },
      },
    });
  });

  test("lists recent emails", async () => {
    const service = new GmailService("fake-access-token");

    const result = await service.listRecentEmails(10);

    expect(result.emails).toHaveLength(2);
    expect(result.emails[0].id).toBe("msg-1");
  });

  test("gets email details", async () => {
    const service = new GmailService("fake-access-token");

    const email = await service.getEmailDetails("msg-1");

    expect(email.from).toBe("sender@example.com");
    expect(email.subject).toBe("Test Subject");
    expect(email.body).toBe("Hello World");
  });

  test("sendEmail sends an email successfully", async () => {
    const service = new GmailService("fake-access-token");

    const result = await service.sendEmail(
      "recipient@example.com",
      "Test Email",
      "This is a test message"
    );

    expect(result.id).toBe("sent-msg-1");
    expect(result.threadId).toBe("thread-1");
    expect(mockSend).toHaveBeenCalledWith({
      userId: "me",
      requestBody: {
        raw: expect.any(String),
        threadId: undefined,
      },
    });
  });

  test("sendEmail handles reply threading with replyToMessageId", async () => {
    // Mock the get call for fetching original message headers
    mockGet.mockResolvedValueOnce({
      data: {
        id: "original-msg-1",
        threadId: "thread-123",
        payload: {
          headers: [
            { name: "Message-ID", value: "<original-message-id@example.com>" },
            { name: "References", value: "<earlier-ref@example.com>" },
          ],
        },
      },
    });

    mockSend.mockResolvedValueOnce({
      data: {
        id: "reply-msg-1",
        threadId: "thread-123",
      },
    });

    const service = new GmailService("fake-access-token");

    const result = await service.sendEmail(
      "recipient@example.com",
      "Re: Test Email",
      "This is a reply",
      { replyToMessageId: "original-msg-1" }
    );

    expect(result.id).toBe("reply-msg-1");
    expect(result.threadId).toBe("thread-123");

    // Verify that get was called to fetch original message headers
    expect(mockGet).toHaveBeenCalledWith({
      userId: "me",
      id: "original-msg-1",
      format: "metadata",
      metadataHeaders: ["Message-ID", "References"],
    });

    // Verify send was called with threadId for proper threading
    expect(mockSend).toHaveBeenCalledWith({
      userId: "me",
      requestBody: {
        raw: expect.any(String),
        threadId: "thread-123",
      },
    });
  });

  test("createDraft creates a draft successfully", async () => {
    const service = new GmailService("fake-access-token");

    const result = await service.createDraft(
      "recipient@example.com",
      "Draft Subject",
      "This is a draft message"
    );

    expect(result.id).toBe("draft-1");
    expect(result.messageId).toBe("draft-msg-1");
    expect(mockDraftCreate).toHaveBeenCalledWith({
      userId: "me",
      requestBody: {
        message: {
          raw: expect.any(String),
        },
      },
    });
  });
});
