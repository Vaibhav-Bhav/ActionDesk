/**
 * businessIntelligence.js — Dynamic Business Intelligence Engine
 *
 * Sprint 4.1: Replace hardcoded intelligence with computed intelligence.
 * Derives all insights from the current cards array.
 *
 * Export: generateBusinessIntelligence(cards) → {
 *   executiveSummary, biggestOpportunity, biggestRisk, revenue,
 *   relationships, patterns, priorities, metrics,
 *   // Pre-shaped for existing components:
 *   executiveInsights, businessRelationships, businessSnapshot, miniTrends,
 *   aiPatterns, strategicPriorities,
 * }
 *
 * Constraints: No API calls · No Groq · No new dependencies · Pure functions
 */

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse an Indian-style currency string into a number.
 *   "₹1,20,000"     → 120000
 *   "₹2,40,000/yr"  → 240000
 *   "₹85,000"       → 85000
 *   "₹48,500"       → 48500
 * Returns 0 for unparseable values.
 */
function parseAmount(str) {
  if (!str || typeof str !== "string") return 0;
  const cleaned = str.replace(/[₹,\/yr]/g, "").trim();
  const num = Number(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

/** Format a number back to ₹-display string. */
function formatCurrency(n) {
  if (n >= 100000) {
    const lakhs = n / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
  }
  return `₹${n.toLocaleString("en-IN")}`;
}

/** Days between a deadline string and today. Positive = overdue. */
function overdueDays(deadline) {
  if (!deadline) return 0;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.floor((today - d) / 86400000);
}

/** Days until a deadline. Negative = past due. */
function daysUntil(deadline) {
  return -overdueDays(deadline);
}

function isPending(card) {
  return card.status !== "Done";
}

function isOverdue(card) {
  return isPending(card) && overdueDays(card.deadline) > 0;
}

const PRIORITY_WEIGHT = { High: 3, Medium: 2, Low: 1 };

function priorityWeight(card) {
  return PRIORITY_WEIGHT[card.priority] || 1;
}

function getInitials(name) {
  if (!name) return "??";
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAmount(card) {
  return parseAmount(card.businessValue?.amount);
}

// ─────────────────────────────────────────────────────────────────────────────
// Revenue
// ─────────────────────────────────────────────────────────────────────────────

function computeRevenue(cards) {
  let potentialRevenue = 0;
  let pendingCollection = 0;
  let revenueAtRisk = 0;
  let closedRevenue = 0;

  for (const card of cards) {
    const amt = getAmount(card);
    if (amt === 0) continue;

    if (card.status === "Done") {
      if (["Payment", "Invoice", "Purchase Order"].includes(card.category)) {
        closedRevenue += amt;
      }
    } else {
      // Pending card
      if (["Quotation", "Purchase Order"].includes(card.category)) {
        potentialRevenue += amt;
      }
      if (["Invoice", "Payment"].includes(card.category)) {
        pendingCollection += amt;
      }
      if (card.priority === "High" || isOverdue(card)) {
        revenueAtRisk += amt;
      }
    }
  }

  return {
    potentialRevenue: formatCurrency(potentialRevenue),
    pendingCollection: formatCurrency(pendingCollection),
    revenueAtRisk: formatCurrency(revenueAtRisk),
    closedRevenue: formatCurrency(closedRevenue),
    _raw: { potentialRevenue, pendingCollection, revenueAtRisk, closedRevenue },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Biggest Opportunity
// ─────────────────────────────────────────────────────────────────────────────

function computeBiggestOpportunity(cards) {
  const candidates = cards.filter(
    (c) => isPending(c) && ["Quotation", "Purchase Order"].includes(c.category)
  );

  if (candidates.length === 0) {
    return {
      company: "No pending opportunities",
      insight: "All quotations and purchase orders are completed.",
      estimatedRevenue: "₹0",
      action: "Focus on generating new leads.",
    };
  }

  // Score: amount × (confidence/100) × deadline urgency bonus
  const scored = candidates.map((c) => {
    const amt = getAmount(c);
    const conf = (c.confidence || 50) / 100;
    const remaining = daysUntil(c.deadline);
    // Closer deadlines get higher urgency; overdue gets max urgency
    const urgency = remaining <= 0 ? 2 : remaining <= 3 ? 1.5 : remaining <= 7 ? 1.2 : 1;
    return { card: c, score: amt * conf * urgency };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0].card;

  return {
    company: best.company || best.title,
    insight: best.why_it_matters || best.summary,
    estimatedRevenue: best.businessValue?.amount || formatCurrency(getAmount(best)),
    action: best.recommended_action || "Follow up immediately.",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Biggest Risk
// ─────────────────────────────────────────────────────────────────────────────

function computeBiggestRisk(cards) {
  const riskCategories = ["Invoice", "Payment", "Complaint"];
  const candidates = cards.filter(
    (c) => isPending(c) && riskCategories.includes(c.category)
  );

  if (candidates.length === 0) {
    return {
      company: "No active risks",
      insight: "No overdue invoices, payments, or complaints.",
      businessImpact: "Business operations are running smoothly.",
      action: "Continue monitoring.",
    };
  }

  // Score: priorityWeight × (1 + overdue days) × amount
  const scored = candidates.map((c) => {
    const od = Math.max(overdueDays(c.deadline), 0);
    const amt = Math.max(getAmount(c), 1);
    return { card: c, score: priorityWeight(c) * (1 + od) * amt };
  });

  scored.sort((a, b) => b.score - a.score);
  const worst = scored[0].card;
  const od = overdueDays(worst.deadline);

  const overdueText =
    od > 0
      ? `overdue by ${od} day${od > 1 ? "s" : ""}`
      : "approaching deadline";

  return {
    company: worst.company || worst.title,
    insight: `${worst.category} ${overdueText}. ${worst.summary}`.slice(0, 200),
    businessImpact:
      worst.businessContext ||
      `${worst.businessValue?.label || "Value"}: ${worst.businessValue?.amount || "Unknown"}. Requires immediate attention.`,
    action: worst.recommended_action || "Address immediately.",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Learning (template-based, no LLM)
// ─────────────────────────────────────────────────────────────────────────────

function computeAiLearning(cards) {
  // Look for the most common learning across cards
  const learnings = cards
    .filter((c) => c.learning)
    .map((c) => ({ learning: c.learning, recommendation: c.recommendation }));

  if (learnings.length === 0) {
    return {
      insight: "Not enough data to surface a learning yet.",
      action: "Continue processing business actions to unlock AI learnings.",
    };
  }

  // Count tag frequencies to find dominant themes
  const tagCounts = {};
  for (const card of cards) {
    if (card.tags) {
      for (const tag of card.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }

  // Check for GST pattern (common in the data)
  const gstCards = cards.filter(
    (c) => c.tags && c.tags.some((t) => t.toLowerCase().includes("gst"))
  );
  if (gstCards.length >= 2) {
    return {
      insight: `${gstCards.length} actions involve GST breakup requests. Cards with GST documentation convert faster.`,
      action: "Always attach GST breakup to quotations by default.",
    };
  }

  // Fallback to the first card with a learning
  return {
    insight: learnings[0].learning,
    action: learnings[0].recommendation || "Apply this learning to future actions.",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Relationship Health
// ─────────────────────────────────────────────────────────────────────────────

function computeRelationships(cards) {
  // Group by company
  const companyMap = {};
  for (const card of cards) {
    const name = card.company || "Unknown";
    if (!companyMap[name]) companyMap[name] = [];
    companyMap[name].push(card);
  }

  const relationships = Object.entries(companyMap).map(([company, companyCards], idx) => {
    const pending = companyCards.filter(isPending);
    const done = companyCards.filter((c) => c.status === "Done");

    // Health score: start at 100, deduct for problems
    let healthScore = 100;
    const pendingComplaints = pending.filter((c) => c.category === "Complaint");
    const overdueCards = companyCards.filter(isOverdue);
    const highPriorityPending = pending.filter((c) => c.priority === "High");

    healthScore -= pendingComplaints.length * 20;
    healthScore -= overdueCards.length * 15;
    healthScore -= highPriorityPending.length * 10;
    healthScore = Math.max(0, Math.min(100, healthScore));

    // Status from score
    let status;
    if (healthScore >= 80) status = "Excellent";
    else if (healthScore >= 60) status = "Healthy";
    else if (healthScore >= 40) status = "Needs Attention";
    else status = "Critical";

    // Lifetime value: sum all amounts for this company
    const lifetimeValue = companyCards.reduce((sum, c) => sum + getAmount(c), 0);

    // Trend
    let trend;
    if (overdueCards.length > 0 || pendingComplaints.length > 0) {
      trend = "Declining";
    } else if (pending.length === 0 && done.length > 0) {
      trend = "Stable";
    } else {
      trend = "Improving";
    }

    // Preferred communication channel — most frequent
    const commCounts = {};
    for (const c of companyCards) {
      const comm = c.details?.preferredComm;
      if (comm) commCounts[comm] = (commCounts[comm] || 0) + 1;
    }
    const preferredComm =
      Object.entries(commCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Email";

    // AI recommendation: based on highest-priority pending card
    let aiRecommendation = "No pending actions. Relationship is in good standing.";
    if (pending.length > 0) {
      const topPending = [...pending].sort(
        (a, b) => priorityWeight(b) - priorityWeight(a)
      )[0];
      aiRecommendation =
        topPending.recommended_action ||
        topPending.recommendation ||
        `Follow up on: ${topPending.title}`;
    }

    return {
      id: `rel-${idx + 1}`,
      company,
      health: status,
      healthScore,
      lifetimeValue: formatCurrency(lifetimeValue),
      projectsCompleted: done.length,
      activeProjects: pending.length,
      preferredComm,
      trend,
      aiRecommendation,
      initials: getInitials(company),
    };
  });

  // Sort: Critical first, then Needs Attention, Healthy, Excellent
  const statusOrder = { Critical: 0, "Needs Attention": 1, Healthy: 2, Excellent: 3 };
  relationships.sort((a, b) => (statusOrder[a.health] ?? 4) - (statusOrder[b.health] ?? 4));

  return relationships;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pattern Discovery (aggregation only, no LLM)
// ─────────────────────────────────────────────────────────────────────────────

function computePatterns(cards) {
  const patterns = [];

  // 1. Most common communication channel
  const commCounts = {};
  for (const card of cards) {
    const comm = card.details?.preferredComm;
    if (comm) commCounts[comm] = (commCounts[comm] || 0) + 1;
  }
  const commEntries = Object.entries(commCounts).sort((a, b) => b[1] - a[1]);
  if (commEntries.length > 0) {
    const [topComm, topCount] = commEntries[0];
    const totalComm = commEntries.reduce((s, e) => s + e[1], 0);
    const pct = Math.round((topCount / totalComm) * 100);
    patterns.push({
      id: "pat-comm",
      category: "Communication Pattern",
      insight: `${topComm} is the dominant communication channel, used by ${pct}% of contacts.`,
      evidence: `Based on ${totalComm} cards with communication preferences.`,
      businessImpact: `Prioritise ${topComm} for faster response times.`,
      confidence: pct > 60 ? "High" : "Medium",
      filterLink: { from: "intelligence" },
    });
  }

  // 2. GST / repeat requests
  const gstCards = cards.filter(
    (c) => c.tags && c.tags.some((t) => t.toLowerCase().includes("gst"))
  );
  if (gstCards.length >= 2) {
    const companies = [...new Set(gstCards.map((c) => c.company).filter(Boolean))];
    patterns.push({
      id: "pat-gst",
      category: "Customer Behaviour",
      insight: `${gstCards.length} actions involve GST breakup requests across ${companies.length} customer${companies.length > 1 ? "s" : ""}.`,
      evidence: `Companies: ${companies.join(", ")}.`,
      businessImpact: "Include GST breakup in all quotations to accelerate conversions.",
      confidence: "High",
      filterLink: { company: companies[0], from: "intelligence", highlight: true, expandDetails: true },
    });
  }

  // 3. Average payment delay
  const paymentCards = cards.filter(
    (c) => ["Invoice", "Payment"].includes(c.category) && c.deadline
  );
  if (paymentCards.length > 0) {
    const delays = paymentCards.map((c) => overdueDays(c.deadline));
    const avg = delays.reduce((s, d) => s + d, 0) / delays.length;
    const avgDisplay = Math.abs(Math.round(avg));
    const direction = avg > 0 ? "overdue" : "ahead of schedule";
    patterns.push({
      id: "pat-delay",
      category: "Supplier Pattern",
      insight: `Average payment timeline is ${avgDisplay} day${avgDisplay !== 1 ? "s" : ""} ${direction}.`,
      evidence: `Calculated across ${paymentCards.length} invoice and payment cards.`,
      businessImpact:
        avg > 0
          ? "Late payments risk supplier relationships and credit terms."
          : "On-time payments maintain strong supplier trust.",
      confidence: paymentCards.length >= 3 ? "High" : "Medium",
      filterLink: { category: "Invoice", from: "intelligence", highlight: true },
    });
  }

  // 4. Quotation conversion rate
  const allQuotations = cards.filter((c) => c.category === "Quotation");
  const convertedQuotations = allQuotations.filter((c) => c.status === "Done");
  if (allQuotations.length > 0) {
    const rate = Math.round((convertedQuotations.length / allQuotations.length) * 100);
    patterns.push({
      id: "pat-conv",
      category: "Sales Pattern",
      insight: `Quotation conversion rate is ${rate}% (${convertedQuotations.length} of ${allQuotations.length}).`,
      evidence: `Based on all quotation cards in the system.`,
      businessImpact:
        rate >= 50
          ? "Strong conversion rate — maintain current quotation practices."
          : "Consider improving quotation speed and pricing visibility.",
      confidence: allQuotations.length >= 3 ? "High" : "Medium",
      filterLink: { category: "Quotation", from: "intelligence", highlight: true },
    });
  }

  // 5. Most active customer
  const companyCounts = {};
  for (const card of cards) {
    const name = card.company;
    if (name) companyCounts[name] = (companyCounts[name] || 0) + 1;
  }
  const companyEntries = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]);
  if (companyEntries.length > 0) {
    const [topCompany, cardCount] = companyEntries[0];
    patterns.push({
      id: "pat-active",
      category: "Retention Pattern",
      insight: `${topCompany} is the most active customer with ${cardCount} action${cardCount > 1 ? "s" : ""}.`,
      evidence: `Across ${companyEntries.length} total companies tracked.`,
      businessImpact: "Nurture this relationship — high-activity customers drive repeat revenue.",
      confidence: "High",
      filterLink: { company: topCompany, from: "intelligence", highlight: true, expandDetails: true },
    });
  }

  return patterns;
}

// ─────────────────────────────────────────────────────────────────────────────
// Strategic Priorities
// ─────────────────────────────────────────────────────────────────────────────

function computeStrategicPriorities(cards) {
  const pending = cards.filter(isPending);
  if (pending.length === 0) return [];

  const scored = pending.map((c) => {
    const pw = priorityWeight(c) * 1000;
    const remaining = daysUntil(c.deadline);
    // Urgent deadlines score higher (lower remaining = higher urgency)
    const deadlineScore =
      remaining <= 0 ? 500 : remaining <= 1 ? 400 : remaining <= 3 ? 300 : remaining <= 7 ? 200 : 100;
    const valueScore = getAmount(c) * 0.01;
    const confScore = c.confidence || 50;
    return { card: c, score: pw + deadlineScore + valueScore + confScore };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 4).map((s, i) => {
    const c = s.card;
    const amt = getAmount(c);
    const priorityLabel =
      c.priority === "High" ? "Critical" : c.priority === "Medium" ? "High" : "Medium";

    return {
      id: `sp-${i + 1}`,
      title: c.title,
      reason:
        c.why_it_matters ||
        `${c.category} — ${c.priority} priority${amt > 0 ? `, value ${formatCurrency(amt)}` : ""}.`,
      expectedImpact:
        amt > 0
          ? `${formatCurrency(amt)} ${c.category === "Complaint" ? "relationship retained" : "revenue impact"}`
          : c.recommended_action || "Immediate action required",
      priority: priorityLabel,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Business Snapshot (KPI cards + health)
// ─────────────────────────────────────────────────────────────────────────────

function computeBusinessSnapshot(cards) {
  const pending = cards.filter(isPending);
  const urgentCount = pending.filter((c) => c.priority === "High").length;
  const paymentCount = pending.filter((c) =>
    ["Invoice", "Payment"].includes(c.category)
  ).length;

  // Distinct companies with active (pending) cards
  const activeCompanies = new Set(
    pending.map((c) => c.company).filter(Boolean)
  );

  // Health score: derived from overdue, complaints, urgent counts
  const overdueCount = cards.filter(isOverdue).length;
  const complaintCount = pending.filter((c) => c.category === "Complaint").length;

  let healthScore = 100;
  healthScore -= overdueCount * 12;
  healthScore -= complaintCount * 10;
  healthScore -= Math.max(0, urgentCount - 2) * 8;
  healthScore -= Math.max(0, paymentCount - 2) * 5;
  healthScore = Math.max(0, Math.min(100, healthScore));

  let healthStatus;
  if (healthScore >= 80) healthStatus = "Healthy";
  else if (healthScore >= 60) healthStatus = "Fair";
  else if (healthScore >= 40) healthStatus = "Warning";
  else healthStatus = "Critical";

  const explanationParts = [];
  if (overdueCount === 0) explanationParts.push("No overdue items");
  else explanationParts.push(`${overdueCount} overdue item${overdueCount > 1 ? "s" : ""}`);
  if (complaintCount === 0) explanationParts.push("no open complaints");
  else explanationParts.push(`${complaintCount} complaint${complaintCount > 1 ? "s" : ""} pending`);
  if (paymentCount <= 2) explanationParts.push("payments under control");
  else explanationParts.push(`${paymentCount} payments pending`);

  return {
    urgentActions: { value: urgentCount, label: "Urgent Actions", tone: "danger" },
    pendingPayments: { value: paymentCount, label: "Pending Payments", tone: "warning" },
    customerConversations: {
      value: activeCompanies.size,
      label: "Active Conversations",
      tone: "accent",
    },
    businessHealth: {
      score: healthScore,
      status: healthStatus,
      explanation: explanationParts.join(". ") + ".",
      tone: "success",
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mini Trends
// ─────────────────────────────────────────────────────────────────────────────

function computeMiniTrends(cards) {
  // 1. Communication — % WhatsApp
  const commCards = cards.filter((c) => c.details?.preferredComm);
  const whatsappCount = commCards.filter(
    (c) => c.details.preferredComm === "WhatsApp"
  ).length;
  const whatsappPct = commCards.length > 0 ? Math.round((whatsappCount / commCards.length) * 100) : 0;

  // 2. Most frequent category
  const catCounts = {};
  for (const c of cards) {
    if (c.category) catCounts[c.category] = (catCounts[c.category] || 0) + 1;
  }
  const topCategory =
    Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // 3. Resolution rate
  const doneCount = cards.filter((c) => c.status === "Done").length;
  const resolutionRate = cards.length > 0 ? Math.round((doneCount / cards.length) * 100) : 0;

  // 4. On-time rate (non-overdue as % of cards with deadlines)
  const withDeadline = cards.filter((c) => c.deadline);
  const onTimeCount = withDeadline.filter((c) => !isOverdue(c)).length;
  const onTimePct = withDeadline.length > 0 ? Math.round((onTimeCount / withDeadline.length) * 100) : 100;

  return [
    {
      id: "trend-comm",
      label: "Communication",
      value: `${whatsappPct}%`,
      subLabel: whatsappPct > 50 ? "WhatsApp dominant" : "Mixed channels",
      data: [0, 0, 0, 0, 0, whatsappPct],
      color: "#10B981",
    },
    {
      id: "trend-cat",
      label: "Business Categories",
      value: topCategory,
      subLabel: "Most active category",
      data: [0, 0, 0, 0, 0, catCounts[topCategory] || 0],
      color: "#4F73FF",
    },
    {
      id: "trend-res",
      label: "Resolution Rate",
      value: `${resolutionRate}%`,
      subLabel: `${doneCount} of ${cards.length} resolved`,
      data: [0, 0, 0, 0, 0, resolutionRate],
      color: "#F59E0B",
    },
    {
      id: "trend-dl",
      label: "Deadlines",
      value: `${onTimePct}%`,
      subLabel: "On-time delivery",
      data: [0, 0, 0, 0, 0, onTimePct],
      color: "#A78BFA",
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Metrics
// ─────────────────────────────────────────────────────────────────────────────

function computeMetrics(cards) {
  const pending = cards.filter(isPending);
  const done = cards.filter((c) => c.status === "Done");
  const overdue = cards.filter(isOverdue);
  const companies = new Set(cards.map((c) => c.company).filter(Boolean));

  const completedRevenue = done.reduce((sum, c) => sum + getAmount(c), 0);
  const pendingRevenue = pending.reduce((sum, c) => sum + getAmount(c), 0);

  return {
    totalActions: cards.length,
    pendingActions: pending.length,
    completedActions: done.length,
    overdueActions: overdue.length,
    companies: companies.size,
    completedRevenue,
    pendingRevenue,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Executive Summary
// ─────────────────────────────────────────────────────────────────────────────

function computeExecutiveSummary(revenue, opportunity, risk, metrics, snapshot) {
  const healthStatus = snapshot.businessHealth.status;
  const potentialRev = revenue.potentialRevenue;

  const parts = [`Business health is ${healthStatus}.`];

  if (revenue._raw.potentialRevenue > 0) {
    parts.push(`Potential revenue totals ${potentialRev}.`);
  }

  if (risk.company && risk.company !== "No active risks") {
    parts.push(
      `${risk.company} requires immediate follow-up due to ${risk.insight.split(".")[0].toLowerCase()}.`
    );
  }

  if (opportunity.company && opportunity.company !== "No pending opportunities") {
    parts.push(
      `${opportunity.company} represents today's strongest opportunity.`
    );
  }

  if (metrics.overdueActions > 0) {
    parts.push(
      `${metrics.overdueActions} overdue action${metrics.overdueActions > 1 ? "s" : ""} need attention.`
    );
  }

  return parts.join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate all business intelligence from the current cards.
 *
 * @param {Array} cards — The full cards array from store.js
 * @returns {Object} All intelligence sections, pre-shaped for existing components
 */
export function generateBusinessIntelligence(cards) {
  if (!cards || cards.length === 0) {
    return emptyIntelligence();
  }

  const revenue = computeRevenue(cards);
  const biggestOpportunity = computeBiggestOpportunity(cards);
  const biggestRisk = computeBiggestRisk(cards);
  const aiLearning = computeAiLearning(cards);
  const relationships = computeRelationships(cards);
  const patterns = computePatterns(cards);
  const priorities = computeStrategicPriorities(cards);
  const snapshot = computeBusinessSnapshot(cards);
  const trends = computeMiniTrends(cards);
  const metrics = computeMetrics(cards);

  const executiveSummary = computeExecutiveSummary(
    revenue,
    biggestOpportunity,
    biggestRisk,
    metrics,
    snapshot
  );

  return {
    // Raw intelligence
    executiveSummary,
    biggestOpportunity,
    biggestRisk,
    revenue,
    relationships,
    patterns,
    priorities,
    metrics,

    // Pre-shaped for existing UI components (no component changes needed)
    executiveInsights: {
      opportunity: biggestOpportunity,
      risk: biggestRisk,
      aiLearning,
    },
    businessRelationships: relationships,
    businessSnapshot: snapshot,
    miniTrends: trends,
    aiPatterns: patterns,
    strategicPriorities: priorities,
  };
}

/** Fallback for empty / loading state. */
function emptyIntelligence() {
  return {
    executiveSummary: "No data available. Add business actions to generate intelligence.",
    biggestOpportunity: {
      company: "No data",
      insight: "No cards to analyse.",
      estimatedRevenue: "₹0",
      action: "Import emails, invoices, or WhatsApp messages to get started.",
    },
    biggestRisk: {
      company: "No data",
      insight: "No active risks.",
      businessImpact: "N/A",
      action: "N/A",
    },
    revenue: {
      potentialRevenue: "₹0",
      pendingCollection: "₹0",
      revenueAtRisk: "₹0",
      closedRevenue: "₹0",
      _raw: { potentialRevenue: 0, pendingCollection: 0, revenueAtRisk: 0, closedRevenue: 0 },
    },
    relationships: [],
    patterns: [],
    priorities: [],
    metrics: {
      totalActions: 0,
      pendingActions: 0,
      completedActions: 0,
      overdueActions: 0,
      companies: 0,
      completedRevenue: 0,
      pendingRevenue: 0,
    },
    executiveInsights: {
      opportunity: { company: "No data", insight: "", estimatedRevenue: "₹0", action: "" },
      risk: { company: "No data", insight: "", businessImpact: "", action: "" },
      aiLearning: { insight: "No data available.", action: "" },
    },
    businessRelationships: [],
    businessSnapshot: {
      urgentActions: { value: 0, label: "Urgent Actions", tone: "danger" },
      pendingPayments: { value: 0, label: "Pending Payments", tone: "warning" },
      customerConversations: { value: 0, label: "Active Conversations", tone: "accent" },
      businessHealth: { score: 100, status: "Healthy", explanation: "No data.", tone: "success" },
    },
    miniTrends: [],
    aiPatterns: [],
    strategicPriorities: [],
  };
}
