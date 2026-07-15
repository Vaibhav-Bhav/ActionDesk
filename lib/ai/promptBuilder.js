/**
 * promptBuilder.js — Prompt template registry for AI actions.
 *
 * Sprint 4.3: Registry pattern. Adding a new AI action = adding one entry
 * to PROMPT_TEMPLATES. Each entry is a function (card) → { system, user }.
 *
 * Constraints: No Groq calls here. Pure prompt construction only.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function cardContext(card) {
  const parts = [];
  if (card.company) parts.push(`Company: ${card.company}`);
  if (card.customerSince) parts.push(`Customer Since: ${card.customerSince}`);
  if (card.title) parts.push(`Title: ${card.title}`);
  if (card.category) parts.push(`Category: ${card.category}`);
  if (card.priority) parts.push(`Priority: ${card.priority}`);
  if (card.summary) parts.push(`Summary: ${card.summary}`);
  if (card.businessContext) parts.push(`Business Context: ${card.businessContext}`);
  if (card.businessValue) {
    parts.push(`Business Value: ${card.businessValue.label} — ${card.businessValue.amount}`);
  }
  if (card.why_it_matters) parts.push(`Why It Matters: ${card.why_it_matters}`);
  if (card.recommended_action) parts.push(`Recommended Action: ${card.recommended_action}`);
  if (card.risk) parts.push(`Risk Level: ${card.risk}`);
  if (card.confidence) parts.push(`Confidence: ${card.confidence}%`);
  if (card.deadline) parts.push(`Deadline: ${card.deadline}`);
  if (card.learning) parts.push(`Learning: ${card.learning}`);
  if (card.tags?.length) parts.push(`Tags: ${card.tags.join(", ")}`);

  // Contact details
  if (card.details) {
    const d = card.details;
    if (d.contact) parts.push(`Contact: ${d.contact}`);
    if (d.paymentTerms) parts.push(`Payment Terms: ${d.paymentTerms}`);
    if (d.previousOrders) parts.push(`Previous Orders: ${d.previousOrders}`);
    if (d.expectedDelivery) parts.push(`Expected Delivery: ${d.expectedDelivery}`);
    if (d.owner) parts.push(`Account Owner: ${d.owner}`);
    if (d.notes) parts.push(`Notes: ${d.notes}`);
  }

  return parts.join("\n");
}

function todayFormatted() {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt Templates Registry
// ─────────────────────────────────────────────────────────────────────────────

const PROMPT_TEMPLATES = {
  // ── Draft Formal Quotation ───────────────────────────────────────────────
  "Draft Formal Quotation": (card) => ({
    system: `You are a professional business document generator for an Indian furniture manufacturing business.

Generate a formal quotation document as a JSON object with EXACTLY this structure:

{
  "title": "Formal Quotation — [Company Name]",
  "recipient": {
    "company": "[Company name]",
    "contact": "[Contact person name]",
    "address": "[Inferred or placeholder address]"
  },
  "subject": "[Brief subject line for the quotation]",
  "introduction": "[Professional 2-3 sentence opening paragraph addressing the customer by name, referencing their request]",
  "lineItems": [
    {
      "sno": 1,
      "description": "[Item description inferred from the card context]",
      "qty": "[Quantity as number]",
      "unit": "pcs",
      "unitPrice": "[Unit price as number — infer from total / qty]",
      "total": "[Line total as number]"
    }
  ],
  "gstBreakup": {
    "subtotal": "[Number — sum of line item totals]",
    "cgstRate": 9,
    "cgstAmount": "[Number]",
    "sgstRate": 9,
    "sgstAmount": "[Number]",
    "totalWithGst": "[Number — subtotal + cgst + sgst]"
  },
  "deliveryTimeline": "[Estimated delivery timeline based on card context]",
  "terms": [
    "[Payment terms from card or standard Net 14/30 terms]",
    "[Delivery terms]",
    "[Warranty/quality terms]",
    "[Validity period — typically 15 days]"
  ],
  "closing": "[Professional 2-sentence closing paragraph thanking the customer and inviting confirmation]",
  "metadata": {
    "quotationDate": "${todayFormatted()}",
    "validUntil": "[Date 15 days from today]",
    "quotationRef": "QTN-[generated ref number]"
  }
}

RULES:
- Respond with ONLY the JSON object. No markdown fences, no commentary.
- Infer line items, quantities, and pricing from the card context. Use the business value amount to calculate realistic unit prices.
- All monetary values must be numbers (not strings).
- GST is split as CGST 9% + SGST 9% (intra-state supply).
- Use professional Indian business English.
- If specific details are missing, make reasonable professional inferences — never leave fields empty.`,

    user: `Generate a formal quotation based on this business action card:

${cardContext(card)}

Today's date: ${todayFormatted()}`,
  }),

  // ── Stubs for Sprint 4.4 ────────────────────────────────────────────────
  "Create Payment Reminder": null,
  "Draft Apology & Resolution": null,
  "Schedule Follow-up": null,
  "Draft Payment Confirmation Email": null,
  "Draft Negotiation Reply": null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Set of action types that have real AI implementations. */
export const AI_CAPABLE_ACTIONS = new Set(
  Object.entries(PROMPT_TEMPLATES)
    .filter(([, fn]) => fn !== null)
    .map(([key]) => key)
);

/**
 * Build the prompt messages for a given card and action type.
 *
 * @param {Object} card — The action card
 * @param {string} actionType — The AI action name (must be a key in PROMPT_TEMPLATES)
 * @returns {{ system: string, user: string }}
 * @throws {Error} If action type is not found or not yet implemented
 */
export function buildPrompt(card, actionType) {
  if (!(actionType in PROMPT_TEMPLATES)) {
    throw new Error(`Unknown AI action type: "${actionType}"`);
  }

  const builder = PROMPT_TEMPLATES[actionType];
  if (builder === null) {
    throw new Error(`AI action "${actionType}" is not yet implemented. Coming in Sprint 4.4.`);
  }

  return builder(card);
}
