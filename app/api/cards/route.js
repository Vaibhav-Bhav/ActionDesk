import { NextResponse } from "next/server";
import { getCards, updateCard, resetCards } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ cards: getCards() });
}

export async function PATCH(req) {
  const { id, patch } = await req.json();
  if (!id || !patch) {
    return NextResponse.json({ error: "id and patch are required" }, { status: 400 });
  }
  const updated = updateCard(id, patch);
  if (!updated) return NextResponse.json({ error: "card not found" }, { status: 404 });
  return NextResponse.json({ card: updated });
}

export async function DELETE() {
  const cards = resetCards();
  return NextResponse.json({ cards });
}
