"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Lightbulb, ArrowRight } from "lucide-react";
import { buildActionCenterUrl } from "@/lib/deepLink";

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const CATEGORY_STYLE = {
  "Customer Behaviour": { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  "Supplier Pattern":   { color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20" },
  "Communication Pattern": { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  "Sales Pattern":      { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  "Pricing Pattern":    { color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20" },
  "Retention Pattern":  { color: "text-teal-400",    bg: "bg-teal-500/10",    border: "border-teal-500/20" },
};

const CONFIDENCE_STYLE = {
  High:   { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  Medium: { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
};

export default function PatternDiscovery({ data }) {
  const router = useRouter();

  return (
    <section>
      <div className="mb-3 flex items-center gap-1.5">
        <Sparkles size={13} className="text-muted" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          AI Pattern Discovery
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.map((pattern, i) => {
          const cs = CATEGORY_STYLE[pattern.category] || CATEGORY_STYLE["Customer Behaviour"];
          const conf = CONFIDENCE_STYLE[pattern.confidence] || CONFIDENCE_STYLE.Medium;

          return (
            <motion.div
              key={pattern.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              onClick={() => {
                if (pattern.filterLink) {
                  router.push(buildActionCenterUrl(pattern.filterLink));
                }
              }}
              className={`group rounded-card border border-border bg-surface p-4 transition-shadow hover:shadow-card-hover ${pattern.filterLink ? 'cursor-pointer' : ''}`}
            >
              {/* Category chip */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cs.color} ${cs.bg} ${cs.border}`}
                >
                  <Lightbulb size={9} />
                  {pattern.category}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${conf.color} ${conf.bg} ${conf.border}`}
                >
                  {pattern.confidence}
                </span>
              </div>

              {/* Insight */}
              <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">{pattern.insight}</p>

              {/* Evidence */}
              <p className="mt-2 text-[11px] text-slate-500 leading-snug">{pattern.evidence}</p>

              {/* Business Impact */}
              <div className="mt-3 rounded-md bg-white/[0.02] px-2.5 py-1.5 flex justify-between items-end">
                <div>
                  <p className="text-2xs text-muted">Business Impact</p>
                  <p className="mt-0.5 text-xs text-slate-400">{pattern.businessImpact}</p>
                </div>
                {pattern.filterLink && (
                  <ArrowRight size={12} className={`${cs.color} shrink-0 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0`} />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
