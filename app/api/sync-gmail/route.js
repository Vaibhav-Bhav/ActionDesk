import { NextResponse } from "next/server";
import { extractActionCard } from "@/lib/groq";
import { addCard } from "@/lib/store";
import { MOCK_GMAIL_MESSAGES } from "@/lib/mockSources";

// Simulates connecting to Gmail: the connector itself is mocked (no real
// OAuth / Gmail API call), but every message is run through the real Groq
// extraction pipeline, exactly like a live integration would.
export async function POST() {
  try {
    const results = [];
    for (const msg of MOCK_GMAIL_MESSAGES) {
      const text = `Subject: ${msg.subject}\nFrom: ${msg.from}\n\n${msg.body}`;
      const extracted = await extractActionCard({ text, source: "Gmail" });
      results.push(addCard(extracted, "Gmail"));
    }
    return NextResponse.json({ cards: results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
