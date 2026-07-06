import { NextResponse } from "next/server";
import { extractActionCard } from "@/lib/groq";
import { addCard } from "@/lib/store";

const GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

async function transcribe(file) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set. Add it to your .env.local file.");

  const form = new FormData();
  form.append("file", file, file.name || "voice-note.webm");
  form.append("model", process.env.GROQ_WHISPER_MODEL || "whisper-large-v3");

  const res = await fetch(GROQ_TRANSCRIBE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq transcription error (${res.status}): ${errText}`);
  }
  const data = await res.json();
  return data.text;
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const pastedTranscript = form.get("transcript");

    let transcript = "";

    if (pastedTranscript && pastedTranscript.trim()) {
      // Fallback path for demoing without a real audio file: paste a transcript directly.
      transcript = pastedTranscript.trim();
    } else if (file) {
      transcript = await transcribe(file);
    } else {
      return NextResponse.json(
        { error: "Provide an audio file or a pasted transcript." },
        { status: 400 }
      );
    }

    const extracted = await extractActionCard({ text: transcript, source: "Voice Note" });
    const card = addCard({ ...extracted, summary: extracted.summary }, "Voice Note");
    return NextResponse.json({ card, transcript });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
