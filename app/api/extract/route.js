import { NextResponse } from "next/server";
import { extractActionCard } from "@/lib/groq";
import { addCard } from "@/lib/store";

export async function POST(req) {
  try {
    const { text, source } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    const extracted = await extractActionCard({ text, source: source || "Manual" });
    const card = addCard(extracted, source);
    return NextResponse.json({ card });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
