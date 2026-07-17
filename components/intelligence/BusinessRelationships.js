"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  ArrowUpRight,
  ArrowRight as ArrowRightIcon,
  ArrowDownRight,
  Minus,
  MessageCircle,
  Mail,
  Phone,
  Brain,
  ExternalLink,
  Database,
} from "lucide-react";
import { buildActionCenterUrl, memoryCompanyLink } from "@/lib/deepLink";

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const HEALTH_CONFIG = {
  Excellent: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-400" },
  Healthy:   { color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20",     dot: "bg-sky-400" },
  "Needs Attention": { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-400" },
  Critical:  { color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     dot: "bg-red-400" },
};

const TREND_ICON = {
  Improving: { icon: ArrowUpRight, color: "text-emerald-400" },
  Stable:    { icon: Minus,         color: "text-slate-400" },
  Declining: { icon: ArrowDownRight, color: "text-red-400" },
};

const COMM_ICON = {
  WhatsApp: MessageCircle,
  Email:    Mail,
  Phone:    Phone,
};

export default function BusinessRelationships({ data }) {
  const router = useRouter();

  return (
    <section>
      <div className="mb-3 flex items-center gap-1.5">
        <Users size={13} className="text-muted" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Business Relationships
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.map((rel, i) => {
          const hc = HEALTH_CONFIG[rel.health] || HEALTH_CONFIG.Healthy;
          const TrendIcon = TREND_ICON[rel.trend]?.icon || Minus;
          const trendColor = TREND_ICON[rel.trend]?.color || "text-slate-400";
          const CommIcon = COMM_ICON[rel.preferredComm] || Mail;

          return (
            <motion.div
              key={rel.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="rounded-card border border-border bg-surface p-4 transition-shadow hover:shadow-card-hover"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-slate-300">
                    {rel.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{rel.company}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${hc.dot}`} />
                      <span className={`text-[11px] font-medium ${hc.color}`}>{rel.health}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <TrendIcon size={13} className={trendColor} />
                  <span className={`text-[11px] ${trendColor}`}>{rel.trend}</span>
                </div>
              </div>

              {/* Metrics row */}
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-white/[0.02] px-3 py-2">
                <div>
                  <p className="text-2xs text-muted">Lifetime Value</p>
                  <p className="text-xs font-semibold text-white">{rel.lifetimeValue}</p>
                </div>
                <div>
                  <p className="text-2xs text-muted">Projects</p>
                  <p className="text-xs font-semibold text-white">{rel.projectsCompleted}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <CommIcon size={11} className="text-muted" />
                  <p className="text-xs text-slate-400">{rel.preferredComm}</p>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="mt-3 flex items-start gap-1.5 rounded-md bg-accent/5 px-2.5 py-1.5">
                <Brain size={11} className="mt-0.5 shrink-0 text-accent" />
                <p className="text-[11px] text-accent-light leading-snug">{rel.aiRecommendation}</p>
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() =>
                    router.push(
                      buildActionCenterUrl({
                        company:  rel.company,
                        from:     "relationship",
                        highlight: true,
                        expandDetails: true,
                      })
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-btn bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/10"
                >
                  <ExternalLink size={10} />
                  Open Actions
                </button>
                <button
                  onClick={() => router.push(memoryCompanyLink(rel.company))}
                  className="inline-flex items-center gap-1 rounded-btn bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/10"
                >
                  <Database size={10} />
                  View Memory
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
