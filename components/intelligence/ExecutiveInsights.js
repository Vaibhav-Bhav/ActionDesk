"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Brain, ArrowRight } from "lucide-react";
import { buildActionCenterUrl } from "@/lib/deepLink";

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

/* ── Subtle accent dot ───────────────────────────────────────── */
function AccentDot({ color }) {
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />;
}

/* ── Insight card wrapper ────────────────────────────────────── */
function InsightCard({ icon: Icon, accentColor, borderColor, bgGlow, label, children, index, onClick }) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`rounded-card border bg-surface p-4 transition-shadow hover:shadow-card-hover cursor-pointer ${borderColor}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`flex h-6 w-6 items-center justify-center rounded-md ${bgGlow}`}>
          <Icon size={13} className={accentColor} />
        </div>
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${accentColor}`}>
          {label}
        </span>
      </div>
      {children}
    </motion.div>
  );
}

/**
 * ExecutiveInsights — Highest Opportunity, Biggest Risk, AI Learning.
 * Sprint 4.6: Each card navigates to the matching company in Action Center.
 */
export default function ExecutiveInsights({ data }) {
  const router = useRouter();
  const { opportunity, risk, aiLearning } = data;

  return (
    <section>
      <div className="mb-3 flex items-center gap-1.5">
        <Brain size={13} className="text-muted" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Executive Insights
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* ── Opportunity ─────────────────────────────────────── */}
        <InsightCard
          icon={TrendingUp}
          accentColor="text-emerald-400"
          borderColor="border-emerald-500/15"
          bgGlow="bg-emerald-500/10"
          label="Biggest Opportunity"
          index={0}
          onClick={() =>
            router.push(
              buildActionCenterUrl({
                company:  opportunity.company,
                priority: "High",
                from:     "intelligence",
                highlight: true,
                expandDetails: true,
              })
            )
          }
        >
          <p className="text-sm font-semibold text-white leading-snug">{opportunity.company}</p>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">{opportunity.insight}</p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-2xs text-muted">Est. Revenue</p>
              <p className="text-sm font-bold text-emerald-400">{opportunity.estimatedRevenue}</p>
            </div>
            <AccentDot color="bg-emerald-400" />
          </div>
          <div className="mt-3 flex items-center gap-1.5 rounded-md bg-emerald-500/8 px-2.5 py-1.5">
            <ArrowRight size={11} className="text-emerald-400 shrink-0" />
            <p className="text-[11px] text-emerald-300/90 leading-snug">{opportunity.action}</p>
          </div>
        </InsightCard>

        {/* ── Risk ────────────────────────────────────────────── */}
        <InsightCard
          icon={AlertTriangle}
          accentColor="text-red-400"
          borderColor="border-red-500/15"
          bgGlow="bg-red-500/10"
          label="Biggest Risk"
          index={1}
          onClick={() =>
            router.push(
              buildActionCenterUrl({
                company:  risk.company,
                priority: "High",
                from:     "intelligence",
                highlight: true,
                expandDetails: true,
              })
            )
          }
        >
          <p className="text-sm font-semibold text-white leading-snug">{risk.company}</p>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">{risk.insight}</p>
          <div className="mt-3">
            <p className="text-2xs text-muted">Business Impact</p>
            <p className="mt-0.5 text-xs text-red-300/80 leading-snug">{risk.businessImpact}</p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 rounded-md bg-red-500/8 px-2.5 py-1.5">
            <ArrowRight size={11} className="text-red-400 shrink-0" />
            <p className="text-[11px] text-red-300/90 leading-snug">{risk.action}</p>
          </div>
        </InsightCard>

        {/* ── AI Learning ────────────────────────────────────── */}
        <InsightCard
          icon={Brain}
          accentColor="text-purple-400"
          borderColor="border-purple-500/15"
          bgGlow="bg-purple-500/10"
          label="AI Learning"
          index={2}
          onClick={() =>
            router.push(
              buildActionCenterUrl({
                category: "Quotation",
                from:     "intelligence",
                highlight: true,
              })
            )
          }
        >
          <p className="mt-1 text-sm text-slate-300 leading-relaxed">{aiLearning.insight}</p>
          <div className="mt-4 flex items-center gap-1.5 rounded-md bg-purple-500/8 px-2.5 py-1.5">
            <ArrowRight size={11} className="text-purple-400 shrink-0" />
            <p className="text-[11px] text-purple-300/90 leading-snug">{aiLearning.action}</p>
          </div>
        </InsightCard>
      </div>
    </section>
  );
}
