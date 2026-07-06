// The Golden Rule: every uploaded thing (email, WhatsApp message, invoice,
// voice note, document) ends as ONE common object shape, regardless of source.

export const CATEGORIES = [
  "Invoice",
  "Quotation",
  "Complaint",
  "Meeting",
  "Payment",
  "Purchase Order",
  "Customer Request",
];

export const PRIORITIES = ["High", "Medium", "Low"];

export const SOURCES = ["Gmail", "WhatsApp", "Invoice Upload", "Voice Note", "Manual"];

export const STATUSES = ["Pending", "In Progress", "Done"];

// The canonical Action Card shape. The Groq extraction prompt is instructed
// to return exactly this JSON shape (see lib/groq.js).
export function emptyCard() {
  return {
    id: null,
    title: "",
    source: "Manual",
    category: "Customer Request",
    priority: "Medium",
    summary: "",
    deadline: null,
    recommended_action: "",
    status: "Pending",
    createdAt: null,
  };
}

export function normalizeCard(raw, fallbackSource) {
  const base = emptyCard();
  return {
    ...base,
    ...raw,
    id: raw.id || `card_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    source: raw.source || fallbackSource || base.source,
    category: CATEGORIES.includes(raw.category) ? raw.category : base.category,
    priority: PRIORITIES.includes(raw.priority) ? raw.priority : base.priority,
    status: STATUSES.includes(raw.status) ? raw.status : base.status,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}
