"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

/**
 * IntelligenceBanner — reusable context header for intelligence-powered pages.
 *
 * Props:
 *   title     string         — e.g. "Viewing Today's Business Overview"
 *   subtitle? string         — optional secondary descriptor
 *   stats     { label, value }[]  — compact stat chips (max 4 recommended)
 *   variant?  "default" | "memory" | "insights"  — accent color
 */
export default function IntelligenceBanner({ title, subtitle, stats = [], variant = "default" }) {
  const accent = {
    default:  { dot: "bg-accent",   text: "text-accent",   ring: "border-accent/20",   bg: "bg-accent/8"   },
    memory:   { dot: "bg-purple-400", text: "text-purple-400", ring: "border-purple-400/20", bg: "bg-purple-400/8" },
    insights: { dot: "bg-emerald-400", text: "text-emerald-400", ring: "border-emerald-400/20", bg: "bg-emerald-400/8" },
  }[variant] ?? { dot: "bg-accent", text: "text-accent", ring: "border-accent/20", bg: "bg-accent/8" };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col gap-3 rounded-card border ${accent.ring} ${accent.bg} px-4 py-3 sm:flex-row sm:items-center sm:justify-between`}
    >
      {/* Left: icon + text */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/8`}>
          <Brain size={11} className={accent.text} />
        </div>
        <div className="min-w-0">
          <p className={`text-[12px] font-semibold leading-tight ${accent.text}`}>
            {title}
          </p>
          {subtitle && (
            <p className="text-[11px] text-muted leading-tight mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: stat chips */}
      {stats.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-full border border-border bg-elevated px-2.5 py-0.5"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
              <span className="text-[11px] font-semibold tabular-nums text-slate-200">
                {s.value}
              </span>
              <span className="text-[10px] text-muted">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
