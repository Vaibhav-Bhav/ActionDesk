"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Check, ArrowRight } from "lucide-react";
import CardHeader from "./CardHeader";
import BusinessContext from "./BusinessContext";
import ActionMenu from "./ActionMenu";
import CompletionAnim from "./CompletionAnim";
import AiPreviewModal from "./AiPreviewModal";
import { useToast } from "@/components/ui/Toast";
import { useNotifications } from "@/lib/notifications";

function formatDeadline(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return deadline;
  const today = new Date();
  const diffDays = Math.round((d - new Date(today.toDateString())) / 86400000);
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays < 0) return `Overdue ${Math.abs(diffDays)}d`;
  return `Due in ${diffDays}d`;
}

/**
 * ActionCard2 — executive briefing card for Action Center.
 * Sprint 5 polish: priority communicated via pill (not border), a single
 * `expanded` state drives Business Details + un-clamping Summary/Why This
 * Matters together, and titles/recommended actions never truncate.
 *
 * Sprint 4.3: Added AI generation flow via AiPreviewModal.
 *
 * Props:
 *   card      ActionCard (with extended model)
 *   onUpdate  (updatedCard) => void
 */
export default function ActionCard2({ card, onUpdate }) {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [showAnim, setShowAnim] = useState(false);
  const [actionNote, setActionNote] = useState(null);
  const [expanded, setExpanded] = useState(false);

  // AI modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiActionType, setAiActionType] = useState(null);

  const done = card.status === "Done";
  const deadlineLabel = formatDeadline(card.deadline);

  async function patchCard(patch) {
    onUpdate?.({ ...card, ...patch });
    try {
      await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: card.id, patch }),
      });
    } catch {
      // best-effort
    }
  }

  async function handleMarkDone() {
    if (done) {
      patchCard({ status: "Pending" });
      return;
    }
    setShowAnim(true);
    await new Promise((r) => setTimeout(r, 900));
    setShowAnim(false);
    patchCard({ status: "Done" });
    toast({ message: `"${card.title.slice(0, 50)}…" marked as complete.`, type: "success" });
    addNotification({
      type: "memory",
      title: "Action completed",
      body: `"${card.title.slice(0, 60)}" resolved and saved to Business Memory.`,
    });
  }

  function handleAction(action, resolves) {
    if (resolves) {
      handleMarkDone();
    } else {
      setActionNote(`${action} — drafted successfully.`);
      toast({ message: `${action} — drafted.`, type: "info" });
      setTimeout(() => setActionNote(null), 3500);
    }
  }

  function handleAiAction(actionType) {
    setAiActionType(actionType);
    setAiModalOpen(true);
  }

  function handleAiMarkDone() {
    handleMarkDone();
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`relative card-hover rounded-card border border-border bg-surface px-5 pt-4 pb-3.5 transition-opacity ${done ? "opacity-55" : ""
        }`}
    >
      <CompletionAnim show={showAnim} />

      {/* ── Header: title/meta + deadline ─────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <CardHeader card={card} />
        </div>
        {deadlineLabel && (
          <span
            className={`flex shrink-0 items-center gap-1 text-[10px] font-semibold mt-0.5 ${deadlineLabel.includes("Overdue") || deadlineLabel === "Due today"
                ? "text-danger"
                : deadlineLabel === "Due tomorrow"
                  ? "text-warning"
                  : "text-muted"
              }`}
          >
            <Clock size={10} />
            {deadlineLabel}
          </span>
        )}
      </div>

      {/* ── Summary ───────────────────────────────────────── */}
      <p
        className={`mt-2.5 text-[12px] leading-relaxed text-slate-300 ${expanded ? "" : "line-clamp-2"}`}
        title={expanded ? undefined : card.summary}
      >
        {card.summary}
      </p>

      {/* ── WHY THIS MATTERS + Business Details ─────────── */}
      <div className="mt-3">
        <BusinessContext card={card} expanded={expanded} onToggleExpanded={() => setExpanded((e) => !e)} />
      </div>

      {/* ── Recommended Next Step ─────────────────────────── */}
      {card.recommended_action && (
        <div className="mt-3 flex items-start gap-2 border-l-2 border-warning/50 pl-3">
          <div className="min-w-0 flex items-baseline gap-1.5 flex-wrap">
            <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-warning">
              <ArrowRight size={10} />
              Next
            </span>
            <p className="text-[11.5px] font-medium leading-snug text-slate-200">
              {card.recommended_action}
            </p>
          </div>
        </div>
      )}

      {/* ── Action feedback note ─────────────────────────── */}
      {actionNote && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 border-l-2 border-accent/50 pl-3 py-1 text-[11px] text-accent"
        >
          {actionNote}
        </motion.div>
      )}

      {/* ── Actions row ─────────────────────────────────── */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <ActionMenu
          card={card}
          onAction={handleAction}
          onAiAction={handleAiAction}
          disabled={done}
        />

        <button
          onClick={handleMarkDone}
          className={`flex items-center gap-1.5 rounded-btn border px-3 py-1 text-xs font-semibold transition-all active:scale-[0.97] ${done
            ? "border-border text-muted hover:text-slate-200"
            : "border-success/40 text-success hover:bg-success/10 hover:border-success/60"
            }`}
        >
          <Check size={12} />
          {done ? "Reopen" : "Mark Done"}
        </button>
      </div>

      {/* ── AI Preview Modal ─────────────────────────────── */}
      <AiPreviewModal
        open={aiModalOpen}
        onClose={() => { setAiModalOpen(false); setAiActionType(null); }}
        card={card}
        actionType={aiActionType}
        onMarkDone={handleAiMarkDone}
      />
    </motion.div>
  );
}