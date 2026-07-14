/**
 * intelligenceData.js — Centralised mock data for Business Intelligence.
 *
 * Every section draws from this file. When a real AI backend is connected,
 * replace these exports with API calls — no component changes required.
 */

// ── Section 1 · Executive Insights ─────────────────────────────
export const executiveInsights = {
  opportunity: {
    company: "Sharma Furniture",
    insight: "Repeat customer likely to confirm ₹2.8L order based on past buying pattern.",
    estimatedRevenue: "₹2.8L",
    action: "Call today — customer responds best between 10–11 AM.",
  },
  risk: {
    company: "ABC Timber",
    insight: "Invoice #TM-4821 overdue by 12 days. Supplier relationship weakening.",
    businessImpact: "Delayed timber deliveries may stall 3 active projects.",
    action: "Process payment today to restore priority status.",
  },
  aiLearning: {
    insight: "Customers requesting GST breakup in quotations convert 34% more frequently.",
    action: "Always attach GST breakup to quotations by default.",
  },
};

// ── Section 2 · Business Relationships ─────────────────────────
export const businessRelationships = [
  {
    id: "rel-1",
    company: "Sharma Furniture",
    health: "Excellent",
    lifetimeValue: "₹18.4L",
    projectsCompleted: 12,
    preferredComm: "WhatsApp",
    trend: "Improving",
    aiRecommendation: "Offer early-bird pricing on next bulk order to lock in Q3 revenue.",
    initials: "SF",
  },
  {
    id: "rel-2",
    company: "Gupta Interiors",
    health: "Healthy",
    lifetimeValue: "₹9.2L",
    projectsCompleted: 7,
    preferredComm: "Email",
    trend: "Stable",
    aiRecommendation: "Schedule quarterly review — last meeting was 45 days ago.",
    initials: "GI",
  },
  {
    id: "rel-3",
    company: "ABC Timber",
    health: "Needs Attention",
    lifetimeValue: "₹6.1L",
    projectsCompleted: 4,
    preferredComm: "Phone",
    trend: "Declining",
    aiRecommendation: "Clear pending payment immediately. Relationship score dropped 15% this month.",
    initials: "AT",
  },
  {
    id: "rel-4",
    company: "Metro Hardware",
    health: "Critical",
    lifetimeValue: "₹3.8L",
    projectsCompleted: 2,
    preferredComm: "Email",
    trend: "Declining",
    aiRecommendation: "Unresolved complaint for 18 days. Escalate with a personal call from owner.",
    initials: "MH",
  },
];

// ── Section 3 · Business Snapshot ──────────────────────────────
export const businessSnapshot = {
  urgentActions: { value: 5, label: "Urgent Actions", tone: "danger" },
  pendingPayments: { value: 3, label: "Pending Payments", tone: "warning" },
  customerConversations: { value: 14, label: "Active Conversations", tone: "accent" },
  businessHealth: {
    score: 92,
    status: "Healthy",
    explanation: "No overdue complaints. Payments under control. Customer satisfaction high.",
    tone: "success",
  },
};

// ── Section 4 · Mini Trends ────────────────────────────────────
export const miniTrends = [
  {
    id: "trend-comm",
    label: "Communication",
    value: "68%",
    subLabel: "WhatsApp dominant",
    data: [30, 42, 38, 55, 60, 68],
    color: "#10B981",
  },
  {
    id: "trend-cat",
    label: "Business Categories",
    value: "Invoices",
    subLabel: "Most active category",
    data: [20, 35, 28, 40, 45, 42],
    color: "#4F73FF",
  },
  {
    id: "trend-res",
    label: "Resolution Rate",
    value: "87%",
    subLabel: "+5% vs last week",
    data: [70, 72, 78, 80, 82, 87],
    color: "#F59E0B",
  },
  {
    id: "trend-dl",
    label: "Deadlines",
    value: "94%",
    subLabel: "On-time delivery",
    data: [88, 85, 90, 91, 93, 94],
    color: "#A78BFA",
  },
];

// ── Section 5 · AI Pattern Discovery ───────────────────────────
export const aiPatterns = [
  {
    id: "pat-1",
    category: "Customer Behaviour",
    insight: "Customers requesting GST breakup in quotations convert 34% more often.",
    evidence: "Based on 48 quotations over the last 90 days.",
    businessImpact: "Higher quotation conversion rate.",
    confidence: "High",
  },
  {
    id: "pat-2",
    category: "Supplier Pattern",
    insight: "ABC Timber confirms deliveries 3 days faster after receiving payment reminders.",
    evidence: "Observed across 6 consecutive orders.",
    businessImpact: "Faster project completion timelines.",
    confidence: "High",
  },
  {
    id: "pat-3",
    category: "Communication Pattern",
    insight: "Repeat customers respond 2.5× faster on WhatsApp compared to email.",
    evidence: "Average response: 18 min (WA) vs 47 min (Email).",
    businessImpact: "Faster deal closures with existing clients.",
    confidence: "Medium",
  },
  {
    id: "pat-4",
    category: "Sales Pattern",
    insight: "Monday quotations convert 22% better than Friday quotations.",
    evidence: "Tracked across 31 weeks of quotation data.",
    businessImpact: "Optimised quotation timing for higher conversion.",
    confidence: "High",
  },
  {
    id: "pat-5",
    category: "Pricing Pattern",
    insight: "Orders above ₹1.5L with 2% discount close within 48 hours.",
    evidence: "5 of 6 large orders followed this pattern.",
    businessImpact: "Predictable revenue acceleration for large deals.",
    confidence: "Medium",
  },
  {
    id: "pat-6",
    category: "Retention Pattern",
    insight: "Customers who receive a follow-up within 7 days of delivery reorder 40% sooner.",
    evidence: "Based on 22 repeat customer purchase cycles.",
    businessImpact: "Shorter reorder cycles and higher LTV.",
    confidence: "High",
  },
];

// ── Section 6 · Today's Strategic Priorities ───────────────────
export const strategicPriorities = [
  {
    id: "sp-1",
    title: "Follow up with Sharma Furniture",
    reason: "₹2.8L order likely to close — customer showed high intent yesterday.",
    expectedImpact: "₹2.8L revenue confirmation",
    priority: "Critical",
  },
  {
    id: "sp-2",
    title: "Recover overdue payment from ABC Timber",
    reason: "12 days overdue. Supplier relationship declining — risk of delivery delays.",
    expectedImpact: "Restored supplier trust and unblocked 3 projects",
    priority: "Critical",
  },
  {
    id: "sp-3",
    title: "Prepare GST-inclusive quotation for Gupta Interiors",
    reason: "Customer specifically requested GST breakup — pattern shows higher conversion.",
    expectedImpact: "Higher conversion probability (~34% uplift)",
    priority: "High",
  },
  {
    id: "sp-4",
    title: "Respond to Metro Hardware complaint",
    reason: "Unresolved for 18 days. Customer relationship at critical level.",
    expectedImpact: "Prevent customer churn and reputation damage",
    priority: "High",
  },
];
