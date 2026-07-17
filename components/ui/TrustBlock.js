"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Check, X } from "lucide-react";

/**
 * TrustBlock — reusable AI confidence + data source transparency display.
 *
 * Props:
 *   confidence  { score: number, present: string[], missing: string[] }
 *   compact?    boolean  — shows only score + bar (no source list)
 */
export default function TrustBlock({ confidence, compact = false }) {
  if (!confidence) return null;
  const { score, present = [], missing = [] } = confidence;

  const barColor =
    score >= 85 ? "bg-success" :
    score >= 65 ? "bg-accent"  :
    score >= 45 ? "bg-warning" : "bg-danger";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={`flex flex-col gap-3 ${compact ? "" : "sm:flex-row sm:items-start sm:justify-between"}`}
    >
      {/* Score row */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={11} className="text-muted" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            AI Confidence
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={`h-full rounded-full ${barColor}`}
            />
          </div>
          <span className="text-[11px] font-bold tabular-nums text-slate-200">
            {score}%
          </span>
        </div>
      </div>

      {!compact && (
        <div className="flex flex-col gap-2 sm:items-end">
          {/* Present sources */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-start sm:justify-end">
            {present.map((src) => (
              <div key={src} className="flex items-center gap-1">
                <Check size={9} className="text-success/70 shrink-0" />
                <span className="text-[10px] text-slate-500">{src}</span>
              </div>
            ))}
          </div>

          {/* Missing signals */}
          {missing.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-start sm:justify-end">
              {missing.slice(0, 3).map((src) => (
                <div key={src} className="flex items-center gap-1">
                  <X size={9} className="text-muted/50 shrink-0" />
                  <span className="text-[10px] text-muted/60">{src}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
