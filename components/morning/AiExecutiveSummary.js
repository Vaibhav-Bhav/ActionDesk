"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, RefreshCw, ShieldCheck, Check,
  TrendingUp, AlertTriangle, Clock, Building2,
} from "lucide-react";
import { generateBusinessIntelligence } from "@/lib/businessIntelligence";

// ─────────────────────────────────────────────────────────────────────────────
// Confidence sources shown in the transparency block
// ─────────────────────────────────────────────────────────────────────────────

const DATA_SOURCES = [
  "Current Action Cards",
  "Business Memory",
  "Customer History",
  "Business Intelligence Engine",
];

// ─────────────────────────────────────────────────────────────────────────────
// Business Impact Metrics (computed from BI engine, not hardcoded)
// ─────────────────────────────────────────────────────────────────────────────

function buildMetrics(bi) {
  const pendingCards = bi.metrics?.pendingActions ?? 0;
  const highPriority = bi.businessSnapshot?.urgentActions?.value ?? 0;

  // Count distinct companies that have pending high-priority cards
  // (derived from relationships data — companies with Critical/Needs Attention health)
  const criticalCompanies = (bi.businessRelationships ?? [])
    .filter((r) => r.health === "Critical" || r.health === "Needs Attention")
    .length;

  return [
    {
      id:     "opp",
      icon:   TrendingUp,
      label:  "Revenue Opportunity",
      value:  bi.revenue?.potentialRevenue ?? "₹0",
      tone:   "accent",
      sub:    "Pending quotations & orders",
    },
    {
      id:     "risk",
      icon:   AlertTriangle,
      label:  "Revenue at Risk",
      value:  bi.revenue?.revenueAtRisk ?? "₹0",
      tone:   "danger",
      sub:    "High-priority & overdue items",
    },
    {
      id:     "actions",
      icon:   Clock,
      label:  "High Priority Actions",
      value:  highPriority,
      tone:   "warning",
      sub:    `${pendingCards} total pending`,
    },
    {
      id:     "customers",
      icon:   Building2,
      label:  "Critical Customers",
      value:  criticalCompanies || "—",
      tone:   "success",
      sub:    "Need attention today",
    },
  ];
}

const TONE_STYLE = {
  accent:  { icon: "text-accent",  bg: "bg-accent/10",  border: "border-accent/20"  },
  danger:  { icon: "text-danger",  bg: "bg-danger/10",  border: "border-danger/20"  },
  warning: { icon: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  success: { icon: "text-success", bg: "bg-success/10", border: "border-success/20" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AiExecutiveSummary — premium AI morning brief card.
 *
 * Props:
 *   cards  ActionCard[]
 */
export default function AiExecutiveSummary({ cards }) {
  const [summary,    setSummary]    = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  // Compute BI on the client (pure, no fetch needed)
  const bi = generateBusinessIntelligence(cards);
  const metrics = buildMetrics(bi);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/morning-brief", { method: "POST" });
      const data = await res.json();
      setSummary(data.summary);
      setConfidence(data.confidence);
    } catch (err) {
      setError("Could not generate summary.");
      // Fallback to BI-computed summary
      setSummary(bi.executiveSummary);
      setConfidence(70);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  useEffect(() => {
    if (cards.length > 0) fetchSummary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-border bg-surface overflow-hidden"
    >
      {/* Top accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025] rounded-2xl"
        style={{ background: "radial-gradient(ellipse 50% 30% at 20% 0%, #4F73FF, transparent 70%)" }}
      />

      <div className="p-6">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/15">
              <Sparkles size={12} className="text-accent" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
              AI Executive Summary
            </span>
          </div>
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-btn border border-border px-2.5 py-1 text-[11px] text-muted transition-colors hover:bg-white/5 hover:text-slate-300 disabled:opacity-40"
          >
            <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ── Business Impact Metrics Row ─────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-5 lg:grid-cols-4">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            const t = TONE_STYLE[m.tone];
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className={`rounded-card border ${t.border} ${t.bg} p-3`}
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded-btn bg-white/5 mb-2`}>
                  <Icon size={12} className={t.icon} />
                </div>
                <p className="text-lg font-bold tabular-nums text-white leading-none">
                  {m.value}
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-300 leading-tight">{m.label}</p>
                <p className="mt-0.5 text-[10px] text-muted">{m.sub}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── AI Summary Text ─────────────────────────────────── */}
        <div className="rounded-card border border-border bg-elevated px-5 py-4 min-h-[90px]">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={14} className="text-accent" />
                </motion.div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-4/5 rounded" />
                  <div className="skeleton h-3 w-3/5 rounded" />
                </div>
              </motion.div>
            )}
            {!loading && summary && (
              <motion.p
                key="summary"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-[13px] leading-relaxed text-slate-200"
              >
                {summary}
              </motion.p>
            )}
            {!loading && error && !summary && (
              <motion.p
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ── AI Confidence + Transparency ───────────────────── */}
        {confidence !== null && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between"
          >
            {/* Confidence */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={11} className="text-muted" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  AI Confidence
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-accent"
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-300 tabular-nums">
                  {confidence}%
                </span>
              </div>
            </div>

            {/* Data sources */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {DATA_SOURCES.map((src) => (
                <div key={src} className="flex items-center gap-1">
                  <Check size={9} className="text-success/70 shrink-0" />
                  <span className="text-[10px] text-slate-500">{src}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
