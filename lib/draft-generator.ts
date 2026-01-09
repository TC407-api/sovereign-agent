import OpenAI from "openai";

export type EmailType = "inquiry" | "meeting-request" | "thank-you";

export interface Email {
  subject: string;
  body: string;
  sender: string;
  date: Date;
}

export interface UserPreferences {
  tone?: "formal" | "casual";
  signature?: string;
  greeting?: string;
  closing?: string;
}

export interface EmailThread {
  messages: Email[];
  threadId?: string;
}

export interface EmailDraft {
  subject: string;
  body: string;
}

export async function generateDraft(
  email: Email,
  emailType: EmailType,
  preferences?: UserPreferences,
  thread?: EmailThread
): Promise<EmailDraft> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const tone = preferences?.tone || "professional";
  const signature = preferences?.signature || "";
  const greeting = preferences?.greeting || "";
  const closing = preferences?.closing || "";

  let contextInfo = "";
  if (thread && thread.messages.length > 0) {
    contextInfo = "\n\nPrevious messages in thread:\n" + thread.messages
      .map((m) => `From: ${m.sender}\nSubject: ${m.subject}\n${m.body}`)
      .join("\n---\n");
  }

  const prompt = `Generate an email reply draft for this ${emailType} email.

Original Email:
From: ${email.sender}
Subject: ${email.subject}
Body: ${email.body}${contextInfo}

Tone: ${tone}
${greeting ? `Use greeting: ${greeting}` : ""}
${closing ? `Use closing: ${closing}` : ""}
${signature ? `Include signature: ${signature}` : ""}

Return JSON with: subject (include "Re:"), body (complete draft text)`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an email draft generator. Generate professional, contextually appropriate email replies. Return only valid JSON with subject and body fields.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || "{}";
    const result = JSON.parse(content);

    return {
      subject: result.subject || `Re: ${email.subject}`,
      body: result.body || "Thank you for your email.",
    };
  } catch (error) {
    // Fallback
    return {
      subject: `Re: ${email.subject}`,
      body: `Thank you for your email regarding "${email.subject}".`,
    };
  }
}
