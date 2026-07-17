"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, RefreshCw,
  TrendingUp, AlertTriangle, Clock, Building2,
  Heart, CheckCircle2,
} from "lucide-react";
import { buildIntelligenceContext } from "@/lib/intelligenceEngine";
import TrustBlock from "@/components/ui/TrustBlock";

// ─────────────────────────────────────────────────────────────────────────────
// Business Impact Metric Cards (computed, not hardcoded)
// ─────────────────────────────────────────────────────────────────────────────

function buildMetrics(bi) {
  const pendingCards  = bi.metrics?.pendingActions ?? 0;
  const highPriority  = bi.businessSnapshot?.urgentActions?.value ?? 0;
  const criticalCount = (bi.businessRelationships ?? [])
    .filter((r) => r.health === "Critical" || r.health === "Needs Attention")
    .length;

  return [
    {
      id:    "opp",
      icon:  TrendingUp,
      label: "Revenue Opportunity",
      value: bi.revenue?.potentialRevenue ?? "₹0",
      tone:  "accent",
      sub:   "Pending quotations & orders",
    },
    {
      id:    "risk",
      icon:  AlertTriangle,
      label: "Revenue at Risk",
      value: bi.revenue?.revenueAtRisk ?? "₹0",
      tone:  "danger",
      sub:   "High-priority & overdue items",
    },
    {
      id:    "actions",
      icon:  Clock,
      label: "High Priority",
      value: highPriority,
      tone:  "warning",
      sub:   `${pendingCards} total pending`,
    },
    {
      id:    "customers",
      icon:  Building2,
      label: "Critical Customers",
      // Fix: never show "—", always show a human-readable value
      value: criticalCount > 0 ? criticalCount : "None",
      tone:  criticalCount > 0 ? "danger" : "success",
      sub:   criticalCount > 0 ? "Need attention today" : "No critical customers today",
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
// Health indicator
// ─────────────────────────────────────────────────────────────────────────────

function HealthRow({ bi }) {
  const snap   = bi?.businessSnapshot?.businessHealth;
  const health = bi?.businessRelationships
    ? { status: snap?.status ?? "—", score: snap?.score ?? 0 }
    : null;

  if (!health) return null;

  const color =
    health.score >= 80 ? "text-success" :
    health.score >= 60 ? "text-warning" :
    "text-danger";

  return (
    <div className="flex items-center gap-2">
      <Heart size={13} className={color} />
      <span className={`text-sm font-semibold ${color}`}>{health.status}</span>
      <span className="text-sm text-muted">({health.score}/100)</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sectioned Summary (replaces single paragraph)
// ─────────────────────────────────────────────────────────────────────────────

function SectionedSummary({ bi, aiText, loading }) {
  const opp  = bi?.biggestOpportunity;
  const risk = bi?.biggestRisk;
  const priorities = bi?.strategicPriorities?.slice(0, 3) ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

      {/* Business Health */}
      <div className="rounded-card border border-border bg-elevated p-4 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Business Health</p>
        <HealthRow bi={bi} />
        {bi?.businessSnapshot?.businessHealth?.explanation && (
          <p className="text-[11px] text-muted leading-relaxed line-clamp-2">
            {bi.businessSnapshot.businessHealth.explanation}
          </p>
        )}
      </div>

      {/* Top Opportunity */}
      <div className="rounded-card border border-emerald-500/15 bg-emerald-500/5 p-4 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Top Opportunity</p>
        {opp && opp.company !== "No pending opportunities" ? (
          <>
            <p className="text-sm font-semibold text-white leading-snug">{opp.company}</p>
            <p className="text-[11px] text-emerald-300 font-medium">{opp.estimatedRevenue}</p>
            <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{opp.action}</p>
          </>
        ) : (
          <p className="text-[12px] text-muted">No pending opportunities</p>
        )}
      </div>

      {/* Biggest Risk */}
      <div className="rounded-card border border-red-500/15 bg-red-500/5 p-4 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Biggest Risk</p>
        {risk && risk.company !== "No active risks" ? (
          <>
            <p className="text-sm font-semibold text-white leading-snug">{risk.company}</p>
            <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{risk.insight}</p>
            <p className="text-[11px] text-red-300 font-medium leading-snug">{risk.action}</p>
          </>
        ) : (
          <p className="text-[12px] text-muted">No active risks</p>
        )}
      </div>

      {/* Today's Priorities */}
      <div className="rounded-card border border-border bg-elevated p-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Today's Priorities</p>
        {priorities.length > 0 ? (
          <ul className="space-y-1.5">
            {priorities.map((p, i) => (
              <li key={p.id ?? i} className="flex items-start gap-2">
                <CheckCircle2 size={11} className="text-accent shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-300 leading-snug line-clamp-1">
                  {p.title}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12px] text-muted">No pending priorities</p>
        )}
      </div>
    </div>
  );
}

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
  const [aiText,     setAiText]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  // Build full intelligence context (includes confidence)
  const ctx     = buildIntelligenceContext(cards);
  const metrics = buildMetrics(ctx);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/morning-brief", { method: "POST" });
      const data = await res.json();
      setAiText(data.summary ?? null);
    } catch {
      setError("Could not refresh summary.");
      setAiText(ctx.executiveSummary ?? null);
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

      <div className="p-6 space-y-5">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
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

        {/* ── KPI Metrics Row ─────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            const t    = TONE_STYLE[m.tone];
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                onClick={() => m.href && router.push(m.href)}
                className={`rounded-card border ${t.border} ${t.bg} p-3 ${m.href ? "cursor-pointer hover:brightness-110 transition-all" : ""}`}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-btn bg-white/5 mb-2">
                  <Icon size={12} className={t.icon} />
                </div>
                <p className="text-lg font-bold tabular-nums text-white leading-none">{m.value}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-300 leading-tight">{m.label}</p>
                <p className="mt-0.5 text-[10px] text-muted">{m.sub}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Sectioned Intelligence Summary ──────────────────── */}
        <SectionedSummary bi={ctx} loading={loading} />

        {/* ── Optional AI prose (loading skeleton while generating) ── */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="skel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-card border border-border bg-elevated px-5 py-4 flex items-center gap-3"
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
              </div>
            </motion.div>
          )}

          {!loading && aiText && (
            <motion.div
              key="aitext"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-card border border-border bg-elevated px-5 py-3"
            >
              <p className="text-[12px] text-muted leading-relaxed italic">
                {aiText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Trust Block (shared component) ─────────────────── */}
        <div className="border-t border-border pt-4">
          <TrustBlock confidence={ctx.confidence} />
        </div>

      </div>
    </motion.div>
  );
}
