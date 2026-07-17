"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BrainCircuit, Building2, CheckCircle2, Tag,
  Mail, MessageCircle, FileText, Mic, Lightbulb, ArrowRight,
} from "lucide-react";
import { CATEGORY_STYLE } from "@/lib/demoData";
import { buildActionCenterUrl } from "@/lib/deepLink";

const SOURCE_ICON = {
  Gmail:           { icon: Mail,          color: "text-red-400"    },
  WhatsApp:        { icon: MessageCircle, color: "text-green-400"  },
  "Invoice Upload":{ icon: FileText,      color: "text-yellow-400" },
  "Voice Note":    { icon: Mic,           color: "text-purple-400" },
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d)) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * MemoryCard — rich institutional knowledge card for resolved actions.
 *
 * Props:
 *   card   ActionCard (resolved, with extended model)
 *   index  number  (for stagger delay)
 */
export default function MemoryCard({ card, index = 0 }) {
  const router = useRouter();
  const catStyle = CATEGORY_STYLE[card.category] ?? "bg-white/5 text-muted border-white/10";
  const srcCfg   = SOURCE_ICON[card.source];
  const SrcIcon  = srcCfg?.icon;

  // Build mini-timeline steps from card data
  const timelineSteps = [
    { label: card.source || "Source", done: true },
    { label: card.category,           done: true },
    { label: "Reviewed",              done: true },
    { label: "Knowledge Saved",       done: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-card border border-border bg-surface p-6 space-y-4"
    >
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {card.company && (
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent/8 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                <Building2 size={10} />
                {card.company}
              </span>
            )}
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${catStyle}`}>
              {card.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[14px] font-semibold leading-snug text-slate-200">
            {card.title}
          </h3>
        </div>

        {/* Knowledge Saved badge */}
        <span className="flex shrink-0 items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-success">
          <CheckCircle2 size={10} />
          Knowledge Saved
        </span>
      </div>

      {/* ── Summary + Outcome ─────────────────────────────── */}
      <div className="space-y-1">
        <p className="text-xs leading-relaxed text-muted">{card.summary}</p>
        {card.recommended_action && (
          <p className="text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Outcome: </span>
            {card.recommended_action}
          </p>
        )}
      </div>

      {/* ── AI Learned ────────────────────────────────────── */}
      {card.learning && (
        <div className="rounded-btn border border-purple-500/15 bg-purple-500/5 p-3 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <BrainCircuit size={12} className="text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
              AI Learned
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300 italic">"{card.learning}"</p>
        </div>
      )}

      {/* ── Future Recommendation ─────────────────────────── */}
      {card.recommendation && (
        <div className="rounded-btn border border-accent/15 bg-accent/5 p-3 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Lightbulb size={12} className="text-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
              Recommendation
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">{card.recommendation}</p>
        </div>
      )}

      {/* ── Mini Timeline ─────────────────────────────────── */}
      <div className="flex items-center gap-1 flex-wrap">
        {timelineSteps.map((step, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className={`text-[10px] font-medium ${step.done ? "text-slate-300" : "text-muted"}`}>
              {step.label}
            </span>
            {i < timelineSteps.length - 1 && (
              <ArrowRight size={9} className="text-muted/50" />
            )}
          </div>
        ))}
      </div>

      {/* ── Footer: tags + date + action center link ──────── */}
      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {(card.tags ?? []).slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted"
            >
              <Tag size={8} />
              {tag}
            </span>
          ))}
        </div>

        {/* Source icon + date + deep link */}
        <div className="flex shrink-0 items-center gap-3">
          {card.company && (
            <button
              onClick={() =>
                router.push(
                  buildActionCenterUrl({
                    company:  card.company,
                    from:     "memory",
                    highlight: true,
                  })
                )
              }
              className="flex items-center gap-1 text-[10px] text-accent/70 hover:text-accent transition-colors"
            >
              <ArrowRight size={9} />
              Open actions
            </button>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            {SrcIcon && <SrcIcon size={11} className={srcCfg.color} />}
            <span>{formatDate(card.createdAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
