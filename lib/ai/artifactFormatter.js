/**
 * artifactFormatter.js — Structured artifact formatter registry.
 *
 * Sprint 4.3: Quotation formatter.
 * Sprint 4.4: Added email, whatsapp, stockNote formatters.
 *
 * Registry pattern: FORMATTERS map keyed by action type.
 * Adding a new action = adding one formatter function.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function ensureArray(val) {
  if (Array.isArray(val)) return val;
  if (val) return [val];
  return [];
}

function ensureNum(val) {
  const n = Number(val);
  return Number.isNaN(n) ? 0 : n;
}

function ensureStr(val, fallback = "") {
  return (typeof val === "string" && val.trim()) ? val.trim() : fallback;
}

function nowDate() {
  return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatter Registry
// ─────────────────────────────────────────────────────────────────────────────

const FORMATTERS = {

  // ── Draft Formal Quotation ───────────────────────────────────────────────
  "Draft Formal Quotation": (raw, card) => {
    const lineItems = ensureArray(raw.lineItems || raw.line_items).map((item, i) => ({
      sno: item.sno || i + 1,
      description: ensureStr(item.description, "Item"),
      qty: ensureNum(item.qty || item.quantity),
      unit: ensureStr(item.unit, "pcs"),
      unitPrice: ensureNum(item.unitPrice || item.unit_price),
      total: ensureNum(item.total || item.amount),
    }));

    const gst = raw.gstBreakup || raw.gst_breakup || raw.gst || {};
    const subtotal    = ensureNum(gst.subtotal    || lineItems.reduce((s, li) => s + li.total, 0));
    const cgstRate    = ensureNum(gst.cgstRate    || gst.cgst_rate  || 9);
    const sgstRate    = ensureNum(gst.sgstRate    || gst.sgst_rate  || 9);
    const cgstAmount  = ensureNum(gst.cgstAmount  || gst.cgst_amount  || subtotal * cgstRate / 100);
    const sgstAmount  = ensureNum(gst.sgstAmount  || gst.sgst_amount  || subtotal * sgstRate / 100);
    const totalWithGst = ensureNum(gst.totalWithGst || gst.total_with_gst || subtotal + cgstAmount + sgstAmount);

    const recipient = raw.recipient || {};
    const meta      = raw.metadata  || {};

    return {
      type: "quotation",
      title: ensureStr(raw.title, `Formal Quotation — ${card.company || "Customer"}`),
      sender: raw.sender || { name: "Your Furniture Manufacturing Business", tagline: "Quality Furniture, On Time" },
      recipient: {
        company: ensureStr(recipient.company, card.company || "Customer"),
        contact:  ensureStr(recipient.contact, card.details?.contact?.split("·")[0]?.trim() || ""),
        address:  ensureStr(recipient.address),
      },
      subject:      ensureStr(raw.subject, `Quotation for ${card.title || "goods/services"}`),
      introduction: ensureStr(raw.introduction),
      lineItems,
      gstBreakup: { subtotal, cgstRate, cgstAmount, sgstRate, sgstAmount, totalWithGst },
      deliveryTimeline: ensureStr(raw.deliveryTimeline || raw.delivery_timeline, "To be confirmed"),
      terms:   ensureArray(raw.terms),
      closing: ensureStr(raw.closing, "Thank you for your business."),
      metadata: {
        quotationDate: ensureStr(meta.quotationDate || meta.quotation_date, nowDate()),
        validUntil:    ensureStr(meta.validUntil    || meta.valid_until),
        quotationRef:  ensureStr(meta.quotationRef  || meta.quotation_ref, `QTN-${Date.now().toString(36).toUpperCase()}`),
        generatedAt: new Date().toISOString(),
        cardId:      card.id,
        actionType:  "Draft Formal Quotation",
        confidence:  card.confidence || null,
      },
    };
  },

  // ── Create Payment Reminder (email shape) ────────────────────────────────
  "Create Payment Reminder": (raw, card) => {
    const meta = raw.metadata || {};
    return {
      type: "email",
      actionLabel: "Payment Reminder",
      subject:   ensureStr(raw.subject, "Payment Reminder — Action Required"),
      greeting:  ensureStr(raw.greeting, `Dear ${card.company || "Sir/Madam"},`),
      body:      ensureArray(raw.body || raw.paragraphs),
      closing:   ensureStr(raw.closing, "Warm regards,"),
      signature: ensureStr(raw.signature, "Accounts Team"),
      metadata: {
        emailDate:     ensureStr(meta.emailDate, nowDate()),
        ref:           ensureStr(meta.ref, `INV-${Date.now().toString(36).toUpperCase()}`),
        urgencyLevel:  ensureStr(meta.urgencyLevel, card.risk || "Medium"),
        generatedAt:   new Date().toISOString(),
        cardId:        card.id,
        actionType:    "Create Payment Reminder",
      },
    };
  },

  // ── Draft Apology & Resolution (email shape) ─────────────────────────────
  "Draft Apology & Resolution": (raw, card) => {
    const meta = raw.metadata || {};
    return {
      type: "email",
      actionLabel: "Complaint Resolution",
      subject:   ensureStr(raw.subject, `Re: Your Recent Complaint — ${card.company || "Valued Customer"}`),
      greeting:  ensureStr(raw.greeting, `Dear ${card.company || "Sir/Madam"},`),
      body:      ensureArray(raw.body || raw.paragraphs),
      closing:   ensureStr(raw.closing, "With sincere apologies,"),
      signature: ensureStr(raw.signature, "Customer Relations Team"),
      metadata: {
        emailDate:          ensureStr(meta.emailDate, nowDate()),
        resolutionDeadline: ensureStr(meta.resolutionDeadline, ""),
        urgencyLevel:       "High",
        generatedAt:        new Date().toISOString(),
        cardId:             card.id,
        actionType:         "Draft Apology & Resolution",
      },
    };
  },

  // ── Draft Negotiation Reply (email shape) ────────────────────────────────
  "Draft Negotiation Reply": (raw, card) => {
    const meta = raw.metadata || {};
    return {
      type: "email",
      actionLabel: "Negotiation Reply",
      subject:   ensureStr(raw.subject, `Re: Quotation — ${card.company || "Customer"}`),
      greeting:  ensureStr(raw.greeting, `Dear ${card.company || "Sir/Madam"},`),
      body:      ensureArray(raw.body || raw.paragraphs),
      closing:   ensureStr(raw.closing, "Looking forward to your confirmation,"),
      signature: ensureStr(raw.signature, "Sales Team"),
      metadata: {
        emailDate:  ensureStr(meta.emailDate, nowDate()),
        validUntil: ensureStr(meta.validUntil, ""),
        offerType:  ensureStr(meta.offerType, ""),
        generatedAt: new Date().toISOString(),
        cardId:     card.id,
        actionType: "Draft Negotiation Reply",
      },
    };
  },

  // ── Draft WhatsApp Follow-up (whatsapp shape) ────────────────────────────
  "Draft WhatsApp Follow-up": (raw, card) => {
    const meta = raw.metadata || {};
    const message = ensureStr(raw.message, `Hi ${card.company || "there"},\n\nJust following up on our conversation. Please let us know if you have any questions.\n\nThank you!`);
    return {
      type: "whatsapp",
      message,
      tone:           ensureStr(raw.tone, "Professional"),
      characterCount: message.length,
      metadata: {
        sentDate:   ensureStr(meta.sentDate, nowDate()),
        channel:    "WhatsApp",
        actionType: "Draft WhatsApp Follow-up",
        generatedAt: new Date().toISOString(),
        cardId:     card.id,
      },
    };
  },

  // ── Confirm Stock Availability (stockNote shape) ──────────────────────────
  "Confirm Stock Availability": (raw, card) => {
    const meta  = raw.metadata || {};
    const valid = ["Available", "Partial", "Unavailable"];
    const avail = valid.includes(raw.availability) ? raw.availability : "Available";
    return {
      type:         "stockNote",
      availability: avail,
      headline:     ensureStr(raw.headline, "Stock availability confirmed."),
      message:      ensureStr(raw.message, "All requested items are available. Production can begin immediately."),
      items:        ensureArray(raw.items).map((item) => ({
        name:   ensureStr(item.name, "Item"),
        qty:    ensureStr(String(item.qty || ""), "As per PO"),
        status: ensureStr(item.status, avail === "Available" ? "In Stock" : "Check Required"),
      })),
      dispatch: ensureStr(raw.dispatch, "Within 2–3 business days of order confirmation"),
      nextStep: ensureStr(raw.nextStep, "Please confirm the purchase order to begin production."),
      metadata: {
        confirmedDate: ensureStr(meta.confirmedDate, nowDate()),
        ref:           ensureStr(meta.ref, `PO-${Date.now().toString(36).toUpperCase()}`),
        generatedAt:   new Date().toISOString(),
        cardId:        card.id,
        actionType:    "Confirm Stock Availability",
      },
    };
  },

};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a raw AI response into a structured artifact.
 * @param {string} actionType
 * @param {Object} rawResponse
 * @param {Object} card
 * @returns {Object}
 */
export function formatArtifact(actionType, rawResponse, card) {
  const formatter = FORMATTERS[actionType];
  if (!formatter) {
    throw new Error(`No artifact formatter for action type: "${actionType}"`);
  }
  return formatter(rawResponse, card);
}
