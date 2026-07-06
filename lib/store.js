import { normalizeCard } from "./schema";

// Simple in-memory store. Good enough for a hackathon demo / single dev
// server process. Swap for a real DB (see 05-Database-Design.md) later.
const globalStore = globalThis;

if (!globalStore.__actiondesk_cards) {
  globalStore.__actiondesk_cards = seedCards();
}

function seedCards() {
  const seeds = [
    {
      title: "Invoice from ABC Traders",
      source: "Gmail",
      category: "Invoice",
      priority: "High",
      summary: "ABC Traders sent an invoice for teak wood panels delivered last week. Payment is due soon.",
      deadline: daysFromNow(2),
      recommended_action: "Pay before due date to avoid late fee.",
      status: "Pending",
    },
    {
      title: "Quotation request - Sharma Furniture",
      source: "WhatsApp",
      category: "Quotation",
      priority: "Medium",
      summary: "Sharma Furniture is asking for a quote on 20 dining chairs, walnut finish, for a hotel order.",
      deadline: daysFromNow(3),
      recommended_action: "Send updated price list and lead time.",
      status: "Pending",
    },
    {
      title: "Delivery delay complaint",
      source: "Gmail",
      category: "Complaint",
      priority: "High",
      summary: "Customer Rakesh Traders says the sofa set delivery is 4 days late and is asking for an update.",
      deadline: daysFromNow(1),
      recommended_action: "Call customer with revised delivery date and a goodwill gesture.",
      status: "Pending",
    },
    {
      title: "Site visit - new showroom",
      source: "Voice Note",
      category: "Meeting",
      priority: "Medium",
      summary: "Voice memo about visiting the new showroom site on Saturday morning with the contractor.",
      deadline: daysFromNow(5),
      recommended_action: "Add to calendar and confirm with contractor.",
      status: "Pending",
    },
    {
      title: "Payment received - Verma Enterprises",
      source: "Gmail",
      category: "Payment",
      priority: "Low",
      summary: "Verma Enterprises confirmed payment of the pending balance for the last order.",
      deadline: null,
      recommended_action: "Mark invoice as paid and send receipt.",
      status: "Pending",
    },
  ];
  return seeds.map((s) => normalizeCard(s, s.source));
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function getCards() {
  return globalStore.__actiondesk_cards;
}

export function addCard(raw, fallbackSource) {
  const card = normalizeCard(raw, fallbackSource);
  globalStore.__actiondesk_cards.unshift(card);
  return card;
}

export function addCards(rawList, fallbackSource) {
  return rawList.map((r) => addCard(r, fallbackSource));
}

export function updateCard(id, patch) {
  const cards = globalStore.__actiondesk_cards;
  const idx = cards.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  cards[idx] = { ...cards[idx], ...patch };
  return cards[idx];
}

export function resetCards() {
  globalStore.__actiondesk_cards = seedCards();
  return globalStore.__actiondesk_cards;
}
