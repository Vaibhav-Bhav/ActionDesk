import { NextResponse } from "next/server";
import { getCards } from "@/lib/store";
import { executeAiAction } from "@/lib/ai/aiActions";

export async function POST(req) {
  try {
    const { cardId, actionType } = await req.json();

    if (!cardId || !actionType) {
      return NextResponse.json(
        { error: "cardId and actionType are required." },
        { status: 400 }
      );
    }

    // Find the card from the store
    const cards = getCards();
    const card = cards.find((c) => c.id === cardId);
    if (!card) {
      return NextResponse.json(
        { error: `Card not found: ${cardId}` },
        { status: 404 }
      );
    }

    // Execute the AI action pipeline
    const artifact = await executeAiAction(card, actionType);

    return NextResponse.json({ artifact });
  } catch (err) {
    const status = err.message.includes("not yet implemented") ? 501 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
