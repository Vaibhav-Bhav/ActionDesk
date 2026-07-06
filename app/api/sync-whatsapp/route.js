import { NextResponse } from "next/server";
import { extractActionCard } from "@/lib/groq";
import { addCard } from "@/lib/store";
import { MOCK_WHATSAPP_MESSAGES } from "@/lib/mockSources";

// Simulates connecting to WhatsApp Business API: the connector is mocked,
// but each message is run through the real Groq extraction pipeline.
export async function POST() {
  try {
    const results = [];
    for (const msg of MOCK_WHATSAPP_MESSAGES) {
      const text = `WhatsApp message from ${msg.from}:\n${msg.body}`;
      const extracted = await extractActionCard({ text, source: "WhatsApp" });
      results.push(addCard(extracted, "WhatsApp"));
    }
    return NextResponse.json({ cards: results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
