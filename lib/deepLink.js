/**
 * deepLink.js — Lightweight deep-linking utility for ActionDesk.
 *
 * Sprint 4.6: Connected Intelligence & Deep Linking.
 * No global state libraries. Uses URL query parameters only.
 *
 * URL shape:
 *   /action-center?cardId=<id>&category=<cat>&priority=<pri>&from=<source>&highlight=1
 *   /action-center?company=<name>&from=<source>
 */

// ─────────────────────────────────────────────────────────────────────────────
// Source labels (shown in ContextBanner)
// ─────────────────────────────────────────────────────────────────────────────

export const DEEP_LINK_SOURCES = {
  morning:       "AI Morning Brief",
  intelligence:  "Business Intelligence",
  memory:        "Business Memory",
  relationship:  "Business Relationships",
  priority:      "Strategic Priorities",
  pattern:       "AI Pattern Discovery",
};

// ─────────────────────────────────────────────────────────────────────────────
// Builder — returns a URL string for router.push()
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a /action-center deep link.
 *
 * @param {Object} opts
 * @param {string}  [opts.cardId]    — scroll-to and highlight this card id
 * @param {string}  [opts.company]   — pre-filter by company name
 * @param {string}  [opts.category]  — pre-filter category dropdown
 * @param {string}  [opts.priority]  — pre-filter priority dropdown
 * @param {string}  [opts.status]    — pre-filter status dropdown  (default: "All")
 * @param {string}  [opts.from]      — source label key (see DEEP_LINK_SOURCES)
 * @param {boolean} [opts.highlight] — pulse the card once on land (true by default when cardId set)
 * @param {boolean} [opts.expandDetails] — open Business Details panel on card
 * @param {boolean} [opts.pulseAI]   — pulse the AI Assist button once on land
 */
export function buildActionCenterUrl(opts = {}) {
  const params = new URLSearchParams();

  if (opts.cardId)    params.set("cardId",    opts.cardId);
  if (opts.company)   params.set("company",   opts.company);
  if (opts.category)  params.set("category",  opts.category);
  if (opts.priority)  params.set("priority",  opts.priority);
  if (opts.status && opts.status !== "Pending") params.set("status", opts.status);
  if (opts.from)      params.set("from",      opts.from);

  if (opts.cardId && opts.highlight !== false) params.set("highlight", "1");
  if (opts.expandDetails)  params.set("expandDetails", "1");
  if (opts.pulseAI)        params.set("pulseAI",       "1");

  const qs = params.toString();
  return qs ? `/action-center?${qs}` : "/action-center";
}

// ─────────────────────────────────────────────────────────────────────────────
// Parser — reads URLSearchParams into a typed object
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse URLSearchParams (or a query string) into a deep-link intent object.
 * Safe to call server-side (returns empty object when params is null).
 *
 * @param {URLSearchParams|null} params
 * @returns {{ cardId?, company?, category?, priority?, status?, from?, highlight?, expandDetails?, pulseAI? }}
 */
export function parseDeepLink(params) {
  if (!params) return {};
  return {
    cardId:        params.get("cardId")        || null,
    company:       params.get("company")       || null,
    category:      params.get("category")      || null,
    priority:      params.get("priority")      || null,
    status:        params.get("status")        || null,
    from:          params.get("from")          || null,
    highlight:     params.get("highlight")     === "1",
    expandDetails: params.get("expandDetails") === "1",
    pulseAI:       params.get("pulseAI")       === "1",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience builder helpers (named entry-points used by components)
// ─────────────────────────────────────────────────────────────────────────────

/** Navigate to the best matching card for a strategic priority item. */
export function priorityLink(item) {
  return buildActionCenterUrl({
    cardId:   item.id   || null,
    priority: item.priority || null,
    from:     "priority",
    highlight: true,
    expandDetails: true,
  });
}

/** Navigate to the best matching card for an opportunity / risk. */
export function opportunityLink(company, priority) {
  return buildActionCenterUrl({
    company,
    priority: priority || "High",
    from:     "intelligence",
    highlight: true,
  });
}

/** Navigate to Action Center filtered by company (relationship card). */
export function relationshipLink(company) {
  return buildActionCenterUrl({
    company,
    from: "relationship",
    highlight: true,
  });
}

/** Navigate to Action Center for a specific card from the morning brief. */
export function morningBriefLink(cardId, opts = {}) {
  return buildActionCenterUrl({
    cardId,
    from:     "morning",
    highlight: true,
    ...opts,
  });
}

/** Navigate to Business Memory with a company filter applied. */
export function memoryCompanyLink(company) {
  const params = new URLSearchParams();
  if (company) params.set("company", company);
  params.set("from", "memory");
  return `/business-memory?${params.toString()}`;
}
