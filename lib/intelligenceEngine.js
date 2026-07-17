/**
 * intelligenceEngine.js — Shared Intelligence Layer
 *
 * Sprint 4.7: Wraps the existing Business Intelligence engine with:
 *   1. computeConfidence(cards, bi)   — dynamic, data-driven confidence
 *   2. deriveRelationshipLearnings(cards) — per-company behavioral patterns
 *   3. buildIntelligenceContext(cards) — single entry point for all pages
 *
 * IMPORTANT: businessIntelligence.js is NOT modified.
 * This module is purely additive.
 */

import { generateBusinessIntelligence } from "./businessIntelligence";

// ─────────────────────────────────────────────────────────────────────────────
// PART C — Dynamic Confidence Engine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * computeConfidence — derives AI confidence from available data signals.
 *
 * Returns:
 *   { score: number (0-100), present: string[], missing: string[] }
 *
 * Reusable by: AiExecutiveSummary, AiPreviewModal, morning-brief API
 */
export function computeConfidence(cards = []) {
  let score = 48; // neutral base
  const present = [];
  const missing = [];

  const pending = cards.filter((c) => c.status !== "Done");
  const done    = cards.filter((c) => c.status === "Done");

  // ── Positive signals ──────────────────────────────────────────────────────

  if (cards.length >= 5) {
    score += 10;
    present.push("Sufficient action card data");
  } else {
    missing.push("More action cards needed");
  }

  const hasLearnings = cards.some((c) => c.learning);
  if (hasLearnings) {
    score += 10;
    present.push("Business memory available");
  } else {
    missing.push("Business memory (resolve actions to build)");
  }

  const hasHistory = cards.some(
    (c) => c.details?.previousOrders > 0 || c.customerSince
  );
  if (hasHistory) {
    score += 8;
    present.push("Customer relationship history");
  } else {
    missing.push("Customer history");
  }

  const hasConfidence = cards.some((c) => typeof c.confidence === "number");
  if (hasConfidence) {
    score += 8;
    present.push("AI extraction confidence scores");
  }

  const hasAmounts = cards.some((c) => c.businessValue?.amount);
  if (hasAmounts) {
    score += 7;
    present.push("Business value data");
  } else {
    missing.push("Business value / revenue data");
  }

  const categories = new Set(cards.map((c) => c.category).filter(Boolean));
  if (categories.size >= 3) {
    score += 5;
    present.push("Diverse business activity");
  }

  if (done.length > 0) {
    score += 5;
    present.push("Historical completed actions");
  }

  const hasDealNotes = cards.some((c) => c.details?.notes);
  if (hasDealNotes) {
    score += 4;
    present.push("Deal notes & context");
  }

  // ── Negative signals ──────────────────────────────────────────────────────

  const noCompany = pending.filter((c) => !c.company).length;
  if (noCompany > 2) {
    score -= 6;
    missing.push("Company names for some actions");
  }

  const noDeadline = pending.filter((c) => !c.deadline).length;
  if (noDeadline > 3) {
    score -= 4;
    missing.push("Deadline data for pending actions");
  }

  const noMeetingNotes = !cards.some(
    (c) => c.category === "Meeting" && c.status === "Done"
  );
  if (noMeetingNotes) {
    missing.push("Recent meeting notes");
  }

  score = Math.max(35, Math.min(97, Math.round(score)));

  return { score, present, missing };
}

// ─────────────────────────────────────────────────────────────────────────────
// PART D — Relationship Learning Engine
// ─────────────────────────────────────────────────────────────────────────────

const COMM_VERBS = {
  WhatsApp: "Prefers WhatsApp for quick responses",
  Email:    "Prefers email communication",
  Phone:    "Prefers phone calls",
};

/**
 * deriveRelationshipLearnings — extracts behavioral patterns per company.
 *
 * Returns: Map<companyName, { learnings: string[], trend: string }>
 */
export function deriveRelationshipLearnings(cards) {
  // Group by company
  const byCompany = {};
  for (const card of cards) {
    const name = card.company;
    if (!name) continue;
    if (!byCompany[name]) byCompany[name] = [];
    byCompany[name].push(card);
  }

  const result = {};

  for (const [company, companyCards] of Object.entries(byCompany)) {
    const learnings = [];
    const done   = companyCards.filter((c) => c.status === "Done");
    const pending = companyCards.filter((c) => c.status !== "Done");

    // 1. Communication preference
    const commCounts = {};
    for (const c of companyCards) {
      const comm = c.details?.preferredComm;
      if (comm) commCounts[comm] = (commCounts[comm] || 0) + 1;
    }
    const topComm = Object.entries(commCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topComm && COMM_VERBS[topComm]) learnings.push(COMM_VERBS[topComm]);

    // 2. GST pattern
    const gstCards = companyCards.filter(
      (c) => c.tags?.some((t) => t.toLowerCase().includes("gst"))
    );
    if (gstCards.length >= 1) {
      learnings.push("Always requests GST breakup on quotations");
    }

    // 3. Repeat order pattern
    const maxOrders = Math.max(
      ...companyCards.map((c) => c.details?.previousOrders || 0)
    );
    if (maxOrders >= 3) {
      learnings.push(`Repeat customer — ${maxOrders} previous orders`);
    } else if (maxOrders >= 1) {
      learnings.push(`${maxOrders} previous order${maxOrders > 1 ? "s" : ""} on record`);
    }

    // 4. Payment terms
    const payTerms = companyCards
      .map((c) => c.details?.paymentTerms)
      .filter(Boolean)[0];
    if (payTerms) learnings.push(`Payment terms: ${payTerms}`);

    // 5. From learning fields
    const cardLearnings = companyCards
      .map((c) => c.learning)
      .filter(Boolean)
      .slice(0, 2);
    for (const l of cardLearnings) {
      if (!learnings.some((x) => x === l)) learnings.push(l);
    }

    // 6. Quick response pattern
    const notes = companyCards.map((c) => c.details?.notes).filter(Boolean).join(" ");
    if (notes.toLowerCase().includes("whatsapp") && notes.toLowerCase().includes("faster")) {
      learnings.push("Responds faster on WhatsApp than email");
    }
    if (notes.toLowerCase().includes("morning")) {
      learnings.push("Prefers morning meetings and calls");
    }

    // ── Relationship Trend ────────────────────────────────────────────────
    const complaints = pending.filter((c) => c.category === "Complaint");
    const overdue = companyCards.filter((c) => {
      if (c.status === "Done" || !c.deadline) return false;
      const d = new Date(c.deadline);
      return !Number.isNaN(d.getTime()) && d < new Date();
    });
    const hasHighRisk = pending.some((c) => c.priority === "High");

    let trend;
    if (complaints.length > 0 || overdue.length > 0) {
      trend = "Declining";
    } else if (done.length > 0 && pending.length === 0) {
      trend = "Stable";
    } else if (done.length > 0 && !hasHighRisk) {
      trend = "Stable";
    } else {
      trend = "Improving";
    }

    result[company] = { learnings: learnings.slice(0, 5), trend };
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// PART A — Unified Context Builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildIntelligenceContext — single entry point for all pages.
 *
 * Returns the full enriched intelligence object:
 * {
 *   ...everything from generateBusinessIntelligence(cards),
 *   confidence: { score, present, missing },
 *   relationshipLearnings: Map<company, { learnings, trend }>,
 * }
 */
export function buildIntelligenceContext(cards) {
  const bi         = generateBusinessIntelligence(cards);
  const confidence = computeConfidence(cards);
  const relationshipLearnings = deriveRelationshipLearnings(cards);

  return {
    ...bi,
    confidence,
    relationshipLearnings,
  };
}
