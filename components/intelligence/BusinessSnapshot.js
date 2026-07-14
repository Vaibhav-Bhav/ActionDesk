"use client";

import { motion } from "framer-motion";
import { Activity, AlertTriangle, CreditCard, MessageSquare, Heart } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const TONE_CONFIG = {
  danger:  { color: "text-red-400",     icon: AlertTriangle },
  warning: { color: "text-amber-400",   icon: CreditCard },
  accent:  { color: "text-accent",      icon: MessageSquare },
  success: { color: "text-emerald-400", icon: Heart },
};

function KpiCard({ item, index }) {
  const cfg = TONE_CONFIG[item.tone] || TONE_CONFIG.accent;
  const Icon = cfg.icon;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="rounded-card border border-border bg-surface px-4 py-3.5"
    >
      <div className="flex items-center justify-between">
        <p className={`text-xl font-bold ${cfg.color}`}>{item.value}</p>
        <Icon size={14} className="text-muted" />
      </div>
      <p className="mt-1 text-[11px] text-muted">{item.label}</p>
    </motion.div>
  );
}

function HealthCard({ health, index }) {
  const score = health.score;
  const barColor =
    score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-amber-400" : "bg-red-400";
  const textColor =
    score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="rounded-card border border-border bg-surface px-4 py-3.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-xl font-bold ${textColor}`}>{score}</span>
          <span className="text-xs text-muted">/ 100</span>
        </div>
        <span className={`text-[11px] font-medium ${textColor}`}>{health.status}</span>
      </div>
      {/* Thin score bar */}
      <div className="mt-2 h-1 w-full rounded-full bg-white/5">
        <motion.div
          className={`h-1 rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        />
      </div>
      <p className="mt-2 text-[11px] text-slate-500 leading-snug">{health.explanation}</p>
    </motion.div>
  );
}

export default function BusinessSnapshot({ data }) {
  const kpis = [data.urgentActions, data.pendingPayments, data.customerConversations];

  return (
    <section>
      <div className="mb-3 flex items-center gap-1.5">
        <Activity size={13} className="text-muted" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Business Snapshot
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((item, i) => (
          <KpiCard key={item.label} item={item} index={i} />
        ))}
        <HealthCard health={data.businessHealth} index={3} />
      </div>
    </section>
  );
}
