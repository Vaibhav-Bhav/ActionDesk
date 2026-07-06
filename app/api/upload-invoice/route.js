import { NextResponse } from "next/server";
import { extractActionCard } from "@/lib/groq";
import { addCard } from "@/lib/store";

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf")) {
      // Lazy import so the (fairly large) pdf-parse lib only loads when needed.
      const pdfParse = (await import("pdf-parse")).default;
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else {
      text = buffer.toString("utf-8");
    }

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Could not read any text from this file." },
        { status: 422 }
      );
    }

    const extracted = await extractActionCard({ text, source: "Invoice Upload" });
    const card = addCard(extracted, "Invoice Upload");
    return NextResponse.json({ card });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
