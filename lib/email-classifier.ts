import OpenAI from "openai";

export type PriorityLevel = "urgent" | "important" | "normal" | "low-priority";

export interface EmailTriageResult {
  priority: PriorityLevel;
  confidence: number;
  reasoning: string;
}

export interface Email {
  subject: string;
  body: string;
  sender: string;
}

export async function classifyEmail(email: Email): Promise<EmailTriageResult> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `Classify this email's priority level. Return JSON with: priority ("urgent", "important", "normal", or "low-priority"), confidence (0.0-1.0), and reasoning.

From: ${email.sender}
Subject: ${email.subject}
Body: ${email.body}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an email triage classifier. Return only valid JSON with priority, confidence, and reasoning fields.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || "{}";
    const result = JSON.parse(content);

    return {
      priority: result.priority || "normal",
      confidence: result.confidence || 0.5,
      reasoning: result.reasoning || "Email classified",
    };
  } catch (error) {
    // Fallback for errors
    return {
      priority: "normal",
      confidence: 0.5,
      reasoning: `Classification error: ${error}`,
    };
  }
}
