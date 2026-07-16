/**
 * promptBuilder.js — Prompt template registry for AI actions.
 *
 * Sprint 4.3: Registry pattern.
 * Sprint 4.4: Added Payment Reminder, Complaint Reply, WhatsApp Follow-up,
 *             Stock Availability, Negotiation Reply.
 *
 * Adding a new AI action = adding one entry to PROMPT_TEMPLATES.
 * Each entry: (card) → { system, user }
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared Helpers
// ─────────────────────────────────────────────────────────────────────────────

function cardContext(card) {
  const parts = [];
  if (card.company)         parts.push(`Customer/Company: ${card.company}`);
  if (card.customerSince)   parts.push(`Customer Since: ${card.customerSince}`);
  if (card.title)           parts.push(`Action Title: ${card.title}`);
  if (card.category)        parts.push(`Category: ${card.category}`);
  if (card.priority)        parts.push(`Priority: ${card.priority}`);
  if (card.summary)         parts.push(`Summary: ${card.summary}`);
  if (card.businessContext) parts.push(`Business Context: ${card.businessContext}`);
  if (card.businessValue)   parts.push(`Business Value: ${card.businessValue.label} — ${card.businessValue.amount}`);
  if (card.why_it_matters)  parts.push(`Why It Matters: ${card.why_it_matters}`);
  if (card.recommended_action) parts.push(`Recommended Action: ${card.recommended_action}`);
  if (card.risk)            parts.push(`Risk Level: ${card.risk}`);
  if (card.confidence)      parts.push(`Confidence: ${card.confidence}%`);
  if (card.deadline)        parts.push(`Deadline: ${card.deadline}`);
  if (card.learning)        parts.push(`Previous Learning: ${card.learning}`);
  if (card.tags?.length)    parts.push(`Tags: ${card.tags.join(", ")}`);

  if (card.details) {
    const d = card.details;
    if (d.contact)           parts.push(`Contact: ${d.contact}`);
    if (d.paymentTerms)      parts.push(`Payment Terms: ${d.paymentTerms}`);
    if (d.previousOrders)    parts.push(`Previous Orders: ${d.previousOrders}`);
    if (d.expectedDelivery)  parts.push(`Expected Delivery: ${d.expectedDelivery}`);
    if (d.owner)             parts.push(`Account Owner: ${d.owner}`);
    if (d.preferredComm)     parts.push(`Preferred Communication: ${d.preferredComm}`);
    if (d.notes)             parts.push(`Notes: ${d.notes}`);
  }

  return parts.join("\n");
}

function todayFormatted() {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function inDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

const JSON_RULE = "Respond with ONLY the JSON object. No markdown fences, no extra commentary.";

// ─────────────────────────────────────────────────────────────────────────────
// Prompt Templates Registry
// ─────────────────────────────────────────────────────────────────────────────

const PROMPT_TEMPLATES = {

  // ── 1. Draft Formal Quotation ─────────────────────────────────────────────
  "Draft Formal Quotation": (card) => ({
    system: `You are a professional business document generator for an Indian furniture manufacturer.
The SENDER of this document is always the furniture manufacturing business (the user of this system).
The RECIPIENT is the customer described in the card context.
Never use a supplier name or customer name as the sender.

Generate a formal quotation as a JSON object with EXACTLY this structure:

{
  "title": "Formal Quotation — [Recipient Company Name]",
  "sender": {
    "name": "Your Furniture Manufacturing Business",
    "tagline": "Quality Furniture, On Time"
  },
  "recipient": {
    "company": "[Customer company name from card]",
    "contact": "[Contact person from card]",
    "address": "[City or inferred address]"
  },
  "subject": "[Brief subject line]",
  "introduction": "[Professional 2-3 sentence opening referencing the customer's specific request]",
  "lineItems": [
    {
      "sno": 1,
      "description": "[Item from card context — be specific]",
      "qty": 1,
      "unit": "pcs",
      "unitPrice": 0,
      "total": 0
    }
  ],
  "gstBreakup": {
    "subtotal": 0,
    "cgstRate": 9,
    "cgstAmount": 0,
    "sgstRate": 9,
    "sgstAmount": 0,
    "totalWithGst": 0
  },
  "deliveryTimeline": "[Realistic delivery timeline from card context]",
  "terms": [
    "[Payment terms from card or Net 14 days]",
    "[Delivery terms]",
    "[Quality/warranty terms]",
    "[Quotation validity — 15 days]"
  ],
  "closing": "[2-sentence professional closing thanking the customer and inviting confirmation]",
  "metadata": {
    "quotationDate": "${todayFormatted()}",
    "validUntil": "${inDays(15)}",
    "quotationRef": "QTN-[6 digit ref]"
  }
}

RULES:
- ${JSON_RULE}
- Infer all items, quantities, and pricing from the business value and card context.
- All monetary values must be numbers (not strings). GST = CGST 9% + SGST 9%.
- Use professional Indian business English throughout.
- Never leave any field empty — infer reasonable values.`,

    user: `Generate a formal quotation based on this business action card:

${cardContext(card)}

Today: ${todayFormatted()}`,
  }),

  // ── 2. Create Payment Reminder ────────────────────────────────────────────
  "Create Payment Reminder": (card) => ({
    system: `You are a professional business communication assistant for an Indian furniture manufacturer.
Generate a polite but firm payment reminder email as a JSON object with EXACTLY this structure:

{
  "subject": "[Clear email subject with invoice ref and amount if available]",
  "greeting": "[Salutation — e.g. Dear Mr. Sharma,]",
  "body": [
    "[Paragraph 1: Polite opening, reference to the outstanding invoice/payment]",
    "[Paragraph 2: Clear statement of amount due, due date, and any late fee if applicable]",
    "[Paragraph 3: Easy call to action — how to pay, who to contact if already paid]"
  ],
  "closing": "[Professional closing — e.g. Warm regards,]",
  "signature": "Accounts Team",
  "metadata": {
    "emailDate": "${todayFormatted()}",
    "ref": "[Invoice ref from card context or generate one]",
    "urgencyLevel": "[Low | Medium | High — based on risk and deadline]"
  }
}

RULES:
- ${JSON_RULE}
- Tone: professional but warm — not threatening. Match urgency to the risk level in the card.
- Include the exact amount from businessValue if available.
- If deadline is past, acknowledge it without being aggressive.
- Use Indian business English. Keep each paragraph to 2-4 sentences.`,

    user: `Generate a payment reminder email based on this business action card:

${cardContext(card)}

Today: ${todayFormatted()}`,
  }),

  // ── 3. Draft Apology & Resolution ────────────────────────────────────────
  "Draft Apology & Resolution": (card) => ({
    system: `You are a professional customer relations specialist for an Indian furniture manufacturer.
Generate a complaint resolution reply as a JSON object with EXACTLY this structure:

{
  "subject": "[Re: complaint subject — clear and empathetic]",
  "greeting": "[Salutation with contact name if available]",
  "body": [
    "[Paragraph 1: Genuine empathetic acknowledgement of the complaint — validate their frustration]",
    "[Paragraph 2: Brief explanation of what happened — honest, no excuses, no blame-shifting]",
    "[Paragraph 3: Concrete resolution — exactly what will be done and by when]",
    "[Paragraph 4: Goodwill gesture or assurance — prevent recurrence, relationship commitment]"
  ],
  "closing": "[Warm professional closing — e.g. With sincere apologies,]",
  "signature": "Customer Relations Team",
  "metadata": {
    "emailDate": "${todayFormatted()}",
    "resolutionDeadline": "[Specific date by which issue will be resolved]",
    "urgencyLevel": "High"
  }
}

RULES:
- ${JSON_RULE}
- Tone: empathetic, accountable, solution-focused. Never defensive.
- The resolution must be specific and time-bound — not vague.
- If the card mentions a specific issue (delivery delay, damaged goods), address it directly.
- Keep each paragraph to 2-4 sentences. Indian business English.`,

    user: `Generate a complaint resolution reply based on this business action card:

${cardContext(card)}

Today: ${todayFormatted()}`,
  }),

  // ── 4. Draft WhatsApp Follow-up ───────────────────────────────────────────
  "Draft WhatsApp Follow-up": (card) => ({
    system: `You are a business communication assistant for an Indian furniture manufacturer.
Generate a short WhatsApp follow-up message as a JSON object with EXACTLY this structure:

{
  "message": "[The complete WhatsApp message — 3 to 6 lines, natural line breaks]",
  "tone": "[Professional | Friendly | Urgent]",
  "characterCount": 0,
  "metadata": {
    "sentDate": "${todayFormatted()}",
    "channel": "WhatsApp",
    "actionType": "Follow-up"
  }
}

RULES:
- ${JSON_RULE}
- The message must feel human, warm, and natural — NOT like a formal letter or robot output.
- 3 to 6 lines maximum. Each line is a distinct thought. Short sentences.
- No emojis unless the context strongly suggests an informal relationship.
- Start with a casual but professional opener (e.g. "Hi [Name],").
- End with a clear next step or question.
- Use the card context to make the message specific — reference actual items, dates, or amounts.
- characterCount should be the actual character count of the message string.`,

    user: `Generate a WhatsApp follow-up message based on this business action card:

${cardContext(card)}

Today: ${todayFormatted()}`,
  }),

  // ── 5. Confirm Stock Availability ─────────────────────────────────────────
  "Confirm Stock Availability": (card) => ({
    system: `You are a business operations assistant for an Indian furniture manufacturer.
Generate a stock availability confirmation note as a JSON object with EXACTLY this structure:

{
  "availability": "Available",
  "headline": "[One clear sentence — e.g. All requested items are currently in stock.]",
  "message": "[2-3 sentence business confirmation — includes what is available, production readiness, dispatch timeline]",
  "items": [
    {
      "name": "[Item name from card context]",
      "qty": "[Quantity]",
      "status": "In Stock"
    }
  ],
  "dispatch": "[Estimated dispatch timeline — e.g. Within 2 business days of order confirmation]",
  "nextStep": "[Clear action — e.g. Please confirm the purchase order to begin production.]",
  "metadata": {
    "confirmedDate": "${todayFormatted()}",
    "ref": "[PO ref from card or generate one]"
  }
}

RULES:
- ${JSON_RULE}
- availability must be one of: "Available" | "Partial" | "Unavailable"
- Keep the tone confident and professional — this should reassure the customer.
- Infer items and quantities from the card context. If exact quantities are unknown, use reasonable estimates.
- The message should be short and decisive — this is not an essay.`,

    user: `Generate a stock availability confirmation based on this business action card:

${cardContext(card)}

Today: ${todayFormatted()}`,
  }),

  // ── 6. Draft Negotiation Reply ────────────────────────────────────────────
  "Draft Negotiation Reply": (card) => ({
    system: `You are a sales negotiation assistant for an Indian furniture manufacturer.
Generate a professional negotiation reply email as a JSON object with EXACTLY this structure:

{
  "subject": "[Re: quotation subject — acknowledging their request]",
  "greeting": "[Salutation with contact name if available]",
  "body": [
    "[Paragraph 1: Thank them for their interest and acknowledge their pricing feedback]",
    "[Paragraph 2: Justify current pricing briefly — quality, materials, timeline — without being defensive]",
    "[Paragraph 3: Offer a reasonable counter — discount, added value, payment terms, or bundle]",
    "[Paragraph 4: Positive close — invite them to confirm or discuss further]"
  ],
  "closing": "[Professional closing — e.g. Looking forward to your confirmation,]",
  "signature": "Sales Team",
  "metadata": {
    "emailDate": "${todayFormatted()}",
    "validUntil": "${inDays(7)}",
    "offerType": "[Discount | Added Value | Payment Terms | Bundle]"
  }
}

RULES:
- ${JSON_RULE}
- Tone: confident, not desperate. Position from value, not fear.
- Reference the actual items and amounts from the card context.
- The counter-offer must be specific — not vague.
- Indian business English. Keep each paragraph 2-3 sentences.`,

    user: `Generate a negotiation reply based on this business action card:

${cardContext(card)}

Today: ${todayFormatted()}`,
  }),

};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Set of action types that have real AI implementations. */
export const AI_CAPABLE_ACTIONS = new Set(Object.keys(PROMPT_TEMPLATES));

/**
 * Build the prompt messages for a given card and action type.
 * @param {Object} card
 * @param {string} actionType
 * @returns {{ system: string, user: string }}
 */
export function buildPrompt(card, actionType) {
  const builder = PROMPT_TEMPLATES[actionType];
  if (!builder) {
    throw new Error(`Unknown or unimplemented AI action type: "${actionType}"`);
  }
  return builder(card);
}
