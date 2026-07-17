"use client";

import { motion } from "framer-motion";
import { BrainCircuit, TrendingUp, Minus, TrendingDown, CheckCircle2 } from "lucide-react";

const TREND_CONFIG = {
  Improving: { icon: TrendingUp,   color: "text-success", bg: "bg-success/10", border: "border-success/20",  label: "Improving"  },
  Stable:    { icon: Minus,         color: "text-accent",  bg: "bg-accent/10",  border: "border-accent/20",   label: "Stable"     },
  Declining: { icon: TrendingDown,  color: "text-danger",  bg: "bg-danger/10",  border: "border-danger/20",   label: "Declining"  },
};

/**
 * RelationshipLearnings — displays AI-derived behavioral patterns for a company.
 *
 * Props:
 *   company   string
 *   learnings string[]
 *   trend     "Improving" | "Stable" | "Declining"
 */
export default function RelationshipLearnings({ company, learnings = [], trend = "Stable" }) {
  if (learnings.length === 0) return null;

  const trendCfg = TREND_CONFIG[trend] ?? TREND_CONFIG.Stable;
  const TrendIcon = trendCfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-btn border border-purple-500/15 bg-purple-500/5 p-3 space-y-3"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <BrainCircuit size={12} className="text-purple-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
            AI Learned
          </span>
        </div>

        {/* Relationship Trend chip */}
        <div className={`flex items-center gap-1 rounded-full border ${trendCfg.border} ${trendCfg.bg} px-2 py-0.5`}>
          <TrendIcon size={9} className={trendCfg.color} />
          <span className={`text-[10px] font-semibold ${trendCfg.color}`}>{trendCfg.label}</span>
        </div>
      </div>

      {/* Bullet learnings */}
      <ul className="space-y-1">
        {learnings.map((l, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <CheckCircle2 size={10} className="text-purple-400/70 shrink-0 mt-0.5" />
            <span className="text-[11px] text-slate-300 leading-snug">{l}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
