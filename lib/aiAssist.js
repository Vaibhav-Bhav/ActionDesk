// Context-aware "AI Assist" menu options. This is what turns ActionDesk
// from "reads information" into "helps you do something with it."

const BY_CATEGORY = {
  Invoice:           ["Create Payment Reminder", "Mark as Paid", "Draft Payment Confirmation Email"],
  Payment:           ["Create Payment Reminder", "Mark as Paid", "Send Receipt"],
  Quotation:         ["Draft Formal Quotation", "Draft WhatsApp Follow-up", "Draft Negotiation Reply", "Accept / Reject"],
  "Purchase Order":  ["Draft Formal Quotation", "Confirm Stock Availability", "Draft WhatsApp Follow-up", "Convert to Task"],
  "Customer Request":["Generate Reply", "Convert to Task", "Schedule Follow-up"],
  Complaint:         ["Draft Apology & Resolution", "Escalate to Owner", "Schedule Follow-up Call"],
  Meeting:           ["Draft WhatsApp Follow-up", "Create Calendar Event", "Assign Task", "Add Reminder"],
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
