"use client";

import { useState } from "react";
import { Sparkles, Clock, ChevronDown, Check } from "lucide-react";
import { getAiActions, RESOLVING_ACTIONS } from "@/lib/aiAssist";

const PRIORITY_DOT = {
  High: "bg-danger",
  Medium: "bg-warning",
  Low: "bg-success",
};

const SOURCE_LABEL = {
  Gmail: "Gmail",
  WhatsApp: "WhatsApp",
  "Invoice Upload": "Invoice",
  "Voice Note": "Voice Note",
  Manual: "Manual",
};

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

export default function ActionCard({ card, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(null);
  const done = card.status === "Done";
  const actions = getAiActions(card);
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
      // best-effort for the MVP; UI already updated optimistically
    }
  }

  function handleAction(action) {
    setOpen(false);
    if (RESOLVING_ACTIONS.has(action)) {
      patchCard({ status: "Done" });
      setNote(`${action} — marked as done.`);
    } else {
      setNote(`${action} — drafted (prototype).`);
    }
    setTimeout(() => setNote(null), 3000);
  }

  return (
    <div
      className={`animate-fadeIn rounded-card border border-border bg-card p-5 transition-opacity ${
        done ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[card.priority]}`} />
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-medium text-muted">
            {card.category}
          </span>
          <span className="text-[11px] text-muted">via {SOURCE_LABEL[card.source] || card.source}</span>
        </div>
        {deadlineLabel && (
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <Clock size={12} />
            {deadlineLabel}
          </span>
        )}
      </div>

      <h3 className="mt-3 text-[15px] font-medium text-white">{card.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{card.summary}</p>

      <div className="mt-3 rounded-btn border border-border bg-white/[0.02] px-3 py-2 text-xs text-slate-300">
        <span className="font-medium text-accent">Suggested: </span>
        {card.recommended_action}
      </div>

      {note && (
        <div className="mt-3 rounded-btn bg-accent-soft px-3 py-2 text-xs text-accent">{note}</div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-btn bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90"
          >
            <Sparkles size={13} />
            AI Assist
            <ChevronDown size={13} />
          </button>
          {open && (
            <div className="absolute left-0 z-10 mt-1.5 w-56 rounded-btn border border-border bg-sidebar p-1 shadow-lg">
              {actions.map((a) => (
                <button
                  key={a}
                  onClick={() => handleAction(a)}
                  className="block w-full rounded-[8px] px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/5"
                >
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => patchCard({ status: done ? "Pending" : "Done" })}
          className={`flex items-center gap-1.5 rounded-btn border px-3 py-1.5 text-xs font-medium ${
            done
              ? "border-border text-muted hover:text-slate-200"
              : "border-success/40 text-success hover:bg-success/10"
          }`}
        >
          <Check size={13} />
          {done ? "Reopen" : "Mark Done"}
        </button>
      </div>
    </div>
  );
}
