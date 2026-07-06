// Thin wrapper around Groq's OpenAI-compatible chat completions endpoint.
// Converts any raw business text (email, WhatsApp message, invoice text,
// voice transcript) into the canonical Action Card JSON shape.
//
// Requires GROQ_API_KEY in the environment. Model defaults to
// openai/gpt-oss-120b (Groq's recommended successor to the retired
// llama-3.3-70b-versatile) but can be overridden with GROQ_MODEL.

import { CATEGORIES, PRIORITIES } from "./schema";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function systemPrompt() {
  return `You are the extraction engine for ActionDesk, a business workspace that turns scattered communication into structured, actionable tasks.

Given a piece of raw business communication (an email, a WhatsApp message, invoice text, or a voice note transcript), extract ONE JSON object with exactly this shape and nothing else:

{
  "title": string,               // short, human-readable, e.g. "Invoice from ABC Traders"
  "category": one of ${JSON.stringify(CATEGORIES)},
  "priority": one of ${JSON.stringify(PRIORITIES)},
  "summary": string,             // 1-2 sentence plain-language summary
  "deadline": string | null,     // ISO date (YYYY-MM-DD) if a deadline/date is mentioned or implied, else null
  "recommended_action": string   // one concrete next step the business owner should take
}

Rules:
- Respond with ONLY the JSON object. No markdown fences, no preamble, no commentary.
- Infer priority from urgency language, money at stake, and complaints/dissatisfaction.
- If the text is in Hinglish or mixes languages, still respond in English.
- Never invent facts that aren't implied by the text; keep summary grounded in the source.`;
}

export async function extractActionCard({ text, source }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set. Add it to your .env.local file.");
  }

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: `Source: ${source}\n\nText:\n${text}` },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned no content");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new Error(`Failed to parse Groq JSON output: ${content}`);
  }

  return { ...parsed, source };
}
