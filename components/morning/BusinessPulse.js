"use client";

import { motion } from "framer-motion";
import { AlertCircle, IndianRupee, MessageSquare, Clock } from "lucide-react";
import { generateBusinessIntelligence } from "@/lib/businessIntelligence";

/**
 * BusinessPulse — four live metric cards.
 * All values computed from the BI engine (no hardcoded amounts).
 *
 * Props:
 *   cards  ActionCard[]
 */
export default function BusinessPulse({ cards }) {
  const bi = generateBusinessIntelligence(cards);
  const snap = bi.businessSnapshot;

  const PULSE_CARDS = [
    {
      id:    "urgent",
      icon:  AlertCircle,
      label: "Urgent Actions",
      sub:   "Requires attention today",
      tone:  "danger",
      value: snap.urgentActions.value,
    },
    {
      id:    "payments",
      icon:  IndianRupee,
      label: "Pending Collection",
      sub:   "Awaiting payment",
      tone:  "warning",
      value: bi.revenue.pendingCollection,
    },
    {
      id:    "conversations",
      icon:  MessageSquare,
      label: "Active Customers",
      sub:   "With open actions",
      tone:  "accent",
      value: snap.customerConversations.value,
    },
    {
      id:    "deadlines",
      icon:  Clock,
      label: "Upcoming Deadlines",
      sub:   "Next 7 days",
      tone:  "success",
      value: (() => {
        const now = new Date();
        const in7 = new Date(now);
        in7.setDate(now.getDate() + 7);
        return cards.filter((c) => {
          if (c.status === "Done" || !c.deadline) return false;
          const d = new Date(c.deadline);
          return !Number.isNaN(d.getTime()) && d >= now && d <= in7;
        }).length;
      })(),
    },
  ];

  const TONE = {
    danger:  { icon: "text-danger",  ring: "border-danger/20",  bg: "bg-danger/8"  },
    warning: { icon: "text-warning", ring: "border-warning/20", bg: "bg-warning/8" },
    accent:  { icon: "text-accent",  ring: "border-accent/20",  bg: "bg-accent/8"  },
    success: { icon: "text-success", ring: "border-success/20", bg: "bg-success/8" },
  };

  const stagger = {
    container: { animate: { transition: { staggerChildren: 0.07 } } },
    item:      { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } },
  };

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {PULSE_CARDS.map((card) => {
        const Icon = card.icon;
        const t = TONE[card.tone];

        return (
          <motion.div
            key={card.id}
            variants={stagger.item}
            className={`card-hover rounded-card border ${t.ring} bg-surface p-5 flex flex-col gap-3`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-btn ${t.bg}`}>
              <Icon size={15} className={t.icon} strokeWidth={2} />
            </div>

            <div>
              <p className="text-2xl font-bold tabular-nums text-white leading-none">
                {card.value}
              </p>
              <p className="mt-1.5 text-[12px] font-medium text-slate-300 leading-tight">
                {card.label}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">{card.sub}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
