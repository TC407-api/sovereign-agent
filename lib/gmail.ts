import { google, gmail_v1 } from "googleapis";

export interface GmailEmail {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  snippet: string;
  date: Date;
}

export interface SendEmailOptions {
  cc?: string;
  bcc?: string;
  replyToMessageId?: string;
}

export interface SendEmailResult {
  id: string;
  threadId: string;
}

export interface CreateDraftResult {
  id: string;
  messageId: string;
}

export class GmailService {
  private gmail: gmail_v1.Gmail;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    this.gmail = google.gmail({ version: "v1", auth });
  }

  async listRecentEmails(
    maxResults: number = 50,
    pageToken?: string
  ): Promise<{ emails: Array<{ id: string; threadId: string }>; nextPageToken?: string }> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: "me",
        maxResults,
        pageToken,
        q: "in:inbox",
      });

      return {
        emails: response.data.messages || [],
        nextPageToken: response.data.nextPageToken || undefined,
      };
    } catch (error) {
      console.error("Failed to list emails:", error);
      throw new Error("Failed to fetch emails from Gmail");
    }
  }

  async getEmailDetails(messageId: string): Promise<GmailEmail> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      const message = response.data;
      const headers = message.payload?.headers || [];

      const getHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";

      // Decode body
      let body = "";
      if (message.payload?.body?.data) {
        body = Buffer.from(message.payload.body.data, "base64").toString("utf-8");
      } else if (message.payload?.parts) {
        const textPart = message.payload.parts.find(
          (p) => p.mimeType === "text/plain"
        );
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
        }
      }

      return {
        id: message.id!,
        threadId: message.threadId!,
        from: getHeader("From"),
        to: getHeader("To"),
        subject: getHeader("Subject"),
        body,
        snippet: message.snippet || "",
        date: new Date(getHeader("Date")),
      };
    } catch (error) {
      console.error("Failed to get email details:", error);
      throw new Error(`Failed to fetch email ${messageId} from Gmail`);
    }
  }

  /**
   * Encodes an email message in RFC 2822 format as base64url for the Gmail API
   */
  private encodeEmail(
    to: string,
    subject: string,
    body: string,
    options?: {
      cc?: string;
      bcc?: string;
      inReplyTo?: string;
      references?: string;
      threadId?: string;
    }
  ): string {
    const lines: string[] = [];

    lines.push(`To: ${to}`);
    if (options?.cc) {
      lines.push(`Cc: ${options.cc}`);
    }
    if (options?.bcc) {
      lines.push(`Bcc: ${options.bcc}`);
    }
    lines.push(`Subject: ${subject}`);
    lines.push("MIME-Version: 1.0");
    lines.push("Content-Type: text/plain; charset=utf-8");

    // Add threading headers for replies
    if (options?.inReplyTo) {
      lines.push(`In-Reply-To: ${options.inReplyTo}`);
    }
    if (options?.references) {
      lines.push(`References: ${options.references}`);
    }

    // Empty line separates headers from body
    lines.push("");
    lines.push(body);

    const email = lines.join("\r\n");

    // Base64url encode (replace + with -, / with _, remove trailing =)
    return Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  /**
   * Sends an email, optionally as a reply to an existing message
   */
  async sendEmail(
    to: string,
    subject: string,
    body: string,
    options?: SendEmailOptions
  ): Promise<SendEmailResult> {
    try {
      let inReplyTo: string | undefined;
      let references: string | undefined;
      let threadId: string | undefined;

      // If replying to a message, fetch the original to get threading headers
      if (options?.replyToMessageId) {
        const originalMessage = await this.gmail.users.messages.get({
          userId: "me",
          id: options.replyToMessageId,
          format: "metadata",
          metadataHeaders: ["Message-ID", "References"],
        });

        const headers = originalMessage.data.payload?.headers || [];
        const messageIdHeader = headers.find(
          (h) => h.name?.toLowerCase() === "message-id"
        )?.value;
        const referencesHeader = headers.find(
          (h) => h.name?.toLowerCase() === "references"
        )?.value;

        if (messageIdHeader) {
          inReplyTo = messageIdHeader;
          // References should include the original message's References plus its Message-ID
          references = referencesHeader
            ? `${referencesHeader} ${messageIdHeader}`
            : messageIdHeader;
        }

        threadId = originalMessage.data.threadId || undefined;
      }

      const raw = this.encodeEmail(to, subject, body, {
        cc: options?.cc,
        bcc: options?.bcc,
        inReplyTo,
        references,
        threadId,
      });

      const response = await this.gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw,
          threadId, // Include threadId to ensure reply is in same thread
        },
      });

      return {
        id: response.data.id!,
        threadId: response.data.threadId!,
      };
    } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error("Failed to send email via Gmail");
    }
  }

  /**
   * Creates a draft email
   */
  async createDraft(
    to: string,
    subject: string,
    body: string
  ): Promise<CreateDraftResult> {
    try {
      const raw = this.encodeEmail(to, subject, body);

      const response = await this.gmail.users.drafts.create({
        userId: "me",
        requestBody: {
          message: {
            raw,
          },
        },
      });

      return {
        id: response.data.id!,
        messageId: response.data.message?.id!,
      };
    } catch (error) {
      console.error("Failed to create draft:", error);
      throw new Error("Failed to create draft in Gmail");
    }
  }
}
