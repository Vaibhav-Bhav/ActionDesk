/**
 * artifactFormatter.js — Structured artifact formatter registry.
 *
 * Sprint 4.3: Receives raw AI JSON response, validates it, and returns
 * a guaranteed structured shape for the preview modal to render.
 *
 * Registry pattern: FORMATTERS map keyed by action type.
 * Adding a new action = adding one formatter function.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Ensure a value is an array. */
function ensureArray(val) {
  if (Array.isArray(val)) return val;
  if (val) return [val];
  return [];
}

/** Ensure a value is a number, defaulting to 0. */
function ensureNum(val) {
  const n = Number(val);
  return Number.isNaN(n) ? 0 : n;
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatter Registry
// ─────────────────────────────────────────────────────────────────────────────

const FORMATTERS = {
  /**
   * Draft Formal Quotation formatter.
   * Normalises and validates the Groq response into a predictable shape.
   */
  "Draft Formal Quotation": (raw, card) => {
    // Normalise line items
    const lineItems = ensureArray(raw.lineItems || raw.line_items).map((item, i) => ({
      sno: item.sno || i + 1,
      description: item.description || "Item",
      qty: ensureNum(item.qty || item.quantity),
      unit: item.unit || "pcs",
      unitPrice: ensureNum(item.unitPrice || item.unit_price),
      total: ensureNum(item.total || item.amount),
    }));

    // Normalise GST breakup
    const gst = raw.gstBreakup || raw.gst_breakup || raw.gst || {};
    const subtotal = ensureNum(gst.subtotal || lineItems.reduce((s, li) => s + li.total, 0));
    const cgstRate = ensureNum(gst.cgstRate || gst.cgst_rate || 9);
    const sgstRate = ensureNum(gst.sgstRate || gst.sgst_rate || 9);
    const cgstAmount = ensureNum(gst.cgstAmount || gst.cgst_amount || subtotal * cgstRate / 100);
    const sgstAmount = ensureNum(gst.sgstAmount || gst.sgst_amount || subtotal * sgstRate / 100);
    const totalWithGst = ensureNum(gst.totalWithGst || gst.total_with_gst || subtotal + cgstAmount + sgstAmount);

    // Normalise recipient
    const recipient = raw.recipient || {};

    // Normalise metadata
    const metadata = raw.metadata || {};

    return {
      type: "quotation",
      title: raw.title || `Formal Quotation — ${card.company || "Customer"}`,
      recipient: {
        company: recipient.company || card.company || "Customer",
        contact: recipient.contact || card.details?.contact?.split("·")[0]?.trim() || "",
        address: recipient.address || "",
      },
      subject: raw.subject || `Quotation for ${card.title || "goods/services"}`,
      introduction: raw.introduction || "",
      lineItems,
      gstBreakup: {
        subtotal,
        cgstRate,
        cgstAmount,
        sgstRate,
        sgstAmount,
        totalWithGst,
      },
      deliveryTimeline: raw.deliveryTimeline || raw.delivery_timeline || "To be confirmed",
      terms: ensureArray(raw.terms),
      closing: raw.closing || "Thank you for your business.",
      metadata: {
        quotationDate: metadata.quotationDate || metadata.quotation_date || new Date().toLocaleDateString("en-IN"),
        validUntil: metadata.validUntil || metadata.valid_until || "",
        quotationRef: metadata.quotationRef || metadata.quotation_ref || `QTN-${Date.now().toString(36).toUpperCase()}`,
        generatedAt: new Date().toISOString(),
        cardId: card.id,
        actionType: "Draft Formal Quotation",
        confidence: card.confidence || null,
      },
    };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a raw AI response into a structured artifact.
 *
 * @param {string} actionType — The AI action type
 * @param {Object} rawResponse — The parsed JSON from Groq
 * @param {Object} card — The original action card (for fallback values)
 * @returns {Object} Structured artifact ready for the preview modal
 * @throws {Error} If no formatter exists for the action type
 */
export function formatArtifact(actionType, rawResponse, card) {
  const formatter = FORMATTERS[actionType];
  if (!formatter) {
    throw new Error(`No artifact formatter for action type: "${actionType}"`);
  }
  return formatter(rawResponse, card);
}
