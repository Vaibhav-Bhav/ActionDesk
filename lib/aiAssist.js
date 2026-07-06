// Context-aware "AI Assist" menu options. This is what turns ActionDesk
// from "reads information" into "helps you do something with it."
// Purely client-side/mocked for the MVP — see 04-AI-System-Design.md for
// where this plugs into real actions later.

const BY_CATEGORY = {
  Invoice: ["Mark as Paid", "Create Payment Reminder", "Draft Payment Confirmation Email"],
  Payment: ["Mark as Paid", "Send Receipt", "Create Payment Reminder"],
  Quotation: ["Compare with Previous Quotes", "Draft Negotiation Reply", "Accept / Reject"],
  "Purchase Order": ["Draft Formal Quotation", "Confirm Stock Availability", "Convert to Task"],
  "Customer Request": ["Generate Reply", "Convert to Task", "Schedule Follow-up"],
  Complaint: ["Draft Apology & Resolution", "Escalate to Owner", "Schedule Follow-up Call"],
  Meeting: ["Create Calendar Event", "Assign Task", "Add Reminder"],
};

const BY_SOURCE = {
  "Voice Note": ["Create Meeting", "Assign Task", "Add Reminder"],
};

export function getAiActions(card) {
  return BY_SOURCE[card.source] || BY_CATEGORY[card.category] || ["Convert to Task", "Add Reminder"];
}

// Actions that represent "this is resolved" and should flip status to Done.
export const RESOLVING_ACTIONS = new Set([
  "Mark as Paid",
  "Send Receipt",
  "Accept / Reject",
]);
