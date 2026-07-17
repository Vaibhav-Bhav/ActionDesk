"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Target, ArrowRight, Zap } from "lucide-react";
import { buildActionCenterUrl } from "@/lib/deepLink";

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const PRIORITY_CONFIG = {
  Critical: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", dot: "bg-red-400" },
  High:     { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-400" },
  Medium:   { color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", dot: "bg-sky-400" },
};

/**
 * StrategicPriorities — today's AI-scored priorities.
 * Sprint 4.6: "Take Action" button deep-links to the card with AI pulsed.
 */
export default function StrategicPriorities({ data }) {
  const router = useRouter();

  return (
    <section>
      <div className="mb-3 flex items-center gap-1.5">
        <Target size={13} className="text-muted" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Today&apos;s Strategic Priorities
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.map((item, i) => {
          const pc = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.Medium;

          const href = buildActionCenterUrl({
            cardId:        item.id || null,
            priority:      item.priority || null,
            from:          "priority",
            highlight:     true,
            expandDetails: true,
            pulseAI:       true,
          });

          return (
            <motion.div
              key={item.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="rounded-card border border-border bg-surface p-4 transition-shadow hover:shadow-card-hover"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${pc.color} ${pc.bg} ${pc.border}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${pc.dot}`} />
                  {item.priority}
                </span>
              </div>

              {/* Reason */}
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">{item.reason}</p>

              {/* Expected Impact */}
              <div className="mt-3 rounded-md bg-white/[0.02] px-2.5 py-1.5">
                <p className="text-2xs text-muted">Expected Impact</p>
                <p className="mt-0.5 text-xs text-slate-300">{item.expectedImpact}</p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => router.push(href)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-btn bg-accent/10 px-3 py-1.5 text-[11px] font-semibold text-accent transition-colors hover:bg-accent/20"
              >
                <Zap size={10} />
                Take Action
                <ArrowRight size={10} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
