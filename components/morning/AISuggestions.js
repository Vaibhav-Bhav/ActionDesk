"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Check } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { generateBusinessIntelligence } from "@/lib/businessIntelligence";

/**
 * AISuggestions — derives AI suggestions from live card data via the BI engine.
 *
 * Props:
 *   cards  ActionCard[]
 */
export default function AISuggestions({ cards }) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(null);
  const [done, setDone] = useState(new Set());

  // Derive suggestions from BI engine strategic priorities
  const bi = generateBusinessIntelligence(cards);

  const suggestions = bi.strategicPriorities.slice(0, 4).map((p, i) => {
    // Map priority reason to a sensible action label
    const actionLabel = deriveActionLabel(cards, p);
    return {
      id:     `sp-${i}`,
      title:  actionLabel,
      sub:    p.reason || p.title,
      action: p.title,
    };
  });

  // Fallback if no priorities derived
  const items = suggestions.length > 0
    ? suggestions
    : [{ id: "add-data", title: "Add business data", sub: "Import emails, invoices, or WhatsApp messages.", action: null }];

  async function handleGenerate(item) {
    if (!item.action || done.has(item.id)) return;
    setGenerating(item.id);
    await new Promise((r) => setTimeout(r, 1200));
    setGenerating(null);
    setDone((prev) => new Set([...prev, item.id]));
    toast({ message: `${item.title} — drafted successfully.`, type: "success" });
  }

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/15">
          <Sparkles size={11} className="text-accent" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-accent">
          Suggested by AI
        </p>
      </div>

      <div className="space-y-3">
        {items.map((s, i) => {
          const isGenerating = generating === s.id;
          const isDone       = done.has(s.id);

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.07 }}
              className="flex items-start gap-3 rounded-btn border border-border bg-elevated px-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-slate-200 leading-snug">
                  {s.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted line-clamp-2">
                  {s.sub}
                </p>
              </div>

              <button
                onClick={() => handleGenerate(s)}
                disabled={isGenerating || isDone || !s.action}
                className={`shrink-0 flex items-center gap-1.5 rounded-btn px-3 py-1.5 text-[11px] font-semibold transition-all active:scale-95 disabled:cursor-default ${
                  isDone
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20"
                }`}
              >
                {isGenerating ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : isDone ? (
                  <Check size={11} />
                ) : (
                  <Sparkles size={11} />
                )}
                {isDone ? "Done" : isGenerating ? "..." : "Go"}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: derive a human action label from a strategic priority card
// ─────────────────────────────────────────────────────────────────────────────

const ACTION_MAP = {
  "Purchase Order": "Draft formal quotation",
  "Quotation":      "Send updated quotation",
  "Invoice":        "Create payment reminder",
  "Payment":        "Process payment",
  "Complaint":      "Resolve customer complaint",
  "Meeting":        "Confirm meeting details",
  "Customer Request": "Draft customer reply",
};

function deriveActionLabel(cards, priority) {
  // Find the underlying card by title
  const card = cards.find((c) => c.title === priority.title);
  if (!card) return priority.title;
  const category = card.category;
  const company  = card.company;
  const base = ACTION_MAP[category] || "Follow up";
  return company ? `${base} — ${company}` : base;
}
