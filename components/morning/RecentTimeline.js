"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText, MessageCircle, Mail, Mic, ShoppingCart,
  CreditCard, Users, Wrench,
} from "lucide-react";
import { buildActionCenterUrl } from "@/lib/deepLink";

const CATEGORY_ICON = {
  Invoice:          { icon: FileText,      bg: "bg-yellow-500/10 text-yellow-400" },
  Quotation:        { icon: FileText,      bg: "bg-blue-500/10 text-blue-400" },
  Complaint:        { icon: Wrench,        bg: "bg-danger/10 text-danger" },
  Meeting:          { icon: Users,         bg: "bg-purple-500/10 text-purple-400" },
  Payment:          { icon: CreditCard,    bg: "bg-success/10 text-success" },
  "Purchase Order": { icon: ShoppingCart,  bg: "bg-accent/10 text-accent" },
  "Customer Request":{ icon: MessageCircle,bg: "bg-green-500/10 text-green-400" },
};

const SOURCE_ICON = {
  Gmail:            { icon: Mail,          bg: "bg-red-500/10 text-red-400" },
  WhatsApp:         { icon: MessageCircle, bg: "bg-green-500/10 text-green-400" },
  "Invoice Upload": { icon: FileText,      bg: "bg-yellow-500/10 text-yellow-400" },
  "Voice Note":     { icon: Mic,           bg: "bg-purple-500/10 text-purple-400" },
};

function formatRelative(dateStr) {
  if (!dateStr) return "Just now";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Just now";
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)  return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

/**
 * RecentTimeline — vertical timeline, newest first, max 6 items.
 * Sprint 4.6: Each item deep-links to its card in Action Center.
 *
 * Props:
 *   cards  ActionCard[]
 */
export default function RecentTimeline({ cards }) {
  const router = useRouter();
  const items = [...cards]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  if (items.length === 0) return null;

  return (
    <div>
      <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted">
        Recent Activity
      </p>

      <div className="relative">
        {/* Vertical connector */}
        <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />

        <div className="space-y-1">
          {items.map((card, i) => {
            const cat  = CATEGORY_ICON[card.category] ?? { icon: FileText, bg: "bg-muted/10 text-muted" };
            const Icon = cat.icon;
            const time = formatRelative(card.createdAt);

            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                onClick={() => router.push(buildActionCenterUrl({ cardId: card.id, from: "morning", highlight: true, expandDetails: card.status !== "Done" }))}
                className="group relative flex gap-4 rounded-btn px-2 py-2.5 text-left transition-colors hover:bg-white/[0.035] w-full"
              >
                {/* Icon bubble (sits on the connector line) */}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border ${cat.bg.split(" ")[0]} bg-surface`}
                >
                  <Icon size={13} className={cat.bg.split(" ")[1]} strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[13px] font-medium text-slate-200 group-hover:text-white transition-colors leading-snug">
                      {card.title}
                    </p>
                    <span className="shrink-0 text-[11px] text-muted tabular-nums">{time}</span>
                  </div>
                  {card.recommended_action && (
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {card.recommended_action}
                    </p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
