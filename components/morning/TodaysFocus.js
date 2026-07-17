"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { generateBusinessIntelligence } from "@/lib/businessIntelligence";
import { buildActionCenterUrl } from "@/lib/deepLink";

const PRIORITY_DOT = {
  Critical: "bg-danger",
  High:     "bg-warning",
  Medium:   "bg-accent",
};

const PRIORITY_PILL = {
  Critical: "bg-danger/10 text-danger",
  High:     "bg-warning/10 text-warning",
  Medium:   "bg-accent/10 text-accent",
};

/**
 * TodaysFocus — 3-5 AI-derived priorities from the BI engine.
 *
 * Sprint 4.6: Each priority navigates directly to its card in Action Center.
 *
 * Props:
 *   cards  ActionCard[]
 */
export default function TodaysFocus({ cards }) {
  const router = useRouter();
  const bi = generateBusinessIntelligence(cards);

  // strategicPriorities is already scored by (priority × deadline × value × confidence)
  const items = bi.strategicPriorities.slice(0, 5);

  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
          Today&apos;s Focus
        </p>
        <button
          onClick={() => router.push("/action-center")}
          className="flex items-center gap-1 text-[10px] text-muted hover:text-accent transition-colors"
        >
          View all
          <ArrowRight size={10} />
        </button>
      </div>

      <div className="space-y-1">
        {items.map((item, i) => {
          // Build a targeted deep link for this priority
          const href = buildActionCenterUrl({
            cardId:        item.id || null,
            priority:      item.priority || null,
            from:          "priority",
            highlight:     true,
            expandDetails: true,
          });

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06 }}
              onClick={() => router.push(href)}
              className="group flex w-full items-start gap-3 rounded-btn px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
            >
              {/* Priority dot */}
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[item.priority] ?? "bg-muted"}`}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className="block truncate text-[13px] text-slate-200 group-hover:text-white transition-colors leading-snug">
                  {item.title}
                </span>
                {item.reason && (
                  <span className="block mt-0.5 text-[11px] text-muted leading-snug line-clamp-1">
                    {item.reason}
                  </span>
                )}
              </div>

              {/* Expected impact */}
              {item.expectedImpact && (
                <span className="shrink-0 text-[10px] text-muted font-medium mt-0.5 hidden sm:block max-w-[120px] text-right leading-tight truncate">
                  {item.expectedImpact}
                </span>
              )}

              {/* Priority badge */}
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  PRIORITY_PILL[item.priority] ?? "bg-white/5 text-muted"
                }`}
              >
                {item.priority}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
