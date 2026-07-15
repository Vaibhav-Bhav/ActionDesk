"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, Zap } from "lucide-react";
import { getAiActions, RESOLVING_ACTIONS } from "@/lib/aiAssist";
import { ACTION_DESCRIPTIONS } from "@/lib/demoData";
import { AI_CAPABLE_ACTIONS } from "@/lib/ai/promptBuilder";

// How many px the dropdown needs below the button before it flips upward
const DROPDOWN_HEIGHT_ESTIMATE = 280;

/**
 * ActionMenu — expandable inline AI action menu with hover descriptions.
 * Automatically opens upward when there is insufficient space below.
 *
 * Props:
 *   card          ActionCard
 *   onAction      (action: string, resolves: boolean) => void
 *   onAiAction    (actionType: string) => void  — triggers AI generation modal
 *   disabled      boolean
 */
export default function ActionMenu({ card, onAction, onAiAction, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [hovered, setHovered] = useState(null);
  const btnRef = useRef(null);
  const actions = getAiActions(card);

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUp(spaceBelow < DROPDOWN_HEIGHT_ESTIMATE);
    }
    setOpen((o) => !o);
  }

  function handleAction(action) {
    setOpen(false);
    setHovered(null);

    // If this action has a real AI implementation, route to AI pipeline
    if (AI_CAPABLE_ACTIONS.has(action) && onAiAction) {
      onAiAction(action);
      return;
    }

    // Otherwise, use the existing mock handler
    onAction(action, RESOLVING_ACTIONS.has(action));
  }

  // Positioning classes: opens up or down depending on viewport space
  const positionClass = openUp
    ? "bottom-full mb-1.5"
    : "top-full mt-1.5";

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleToggle}
        disabled={disabled}
        className="flex items-center gap-1.5 rounded-btn bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-accent-light hover:shadow-glow-sm active:scale-[0.97] disabled:opacity-50"
      >
        <Sparkles size={12} />
        AI Assist
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Dismiss overlay */}
            <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />

            <motion.div
              key="action-menu"
              initial={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={`absolute left-0 z-[110] w-72 overflow-hidden rounded-card border border-border bg-elevated shadow-modal ${positionClass}`}
            >
              {/* Description preview pane */}
              <div className="border-b border-border bg-white/[0.02] px-3 py-2 min-h-[40px]">
                {hovered ? (
                  <p className="text-[11px] leading-relaxed text-muted">
                    {ACTION_DESCRIPTIONS[hovered] ?? "Execute this AI action."}
                  </p>
                ) : (
                  <p className="text-[11px] text-subtle">Hover an action to preview what it generates.</p>
                )}
              </div>

              {/* Action list */}
              <div className="p-1.5">
                {actions.map((action) => {
                  const isAi = AI_CAPABLE_ACTIONS.has(action);
                  return (
                    <button
                      key={action}
                      onClick={() => handleAction(action)}
                      onMouseEnter={() => setHovered(action)}
                      onMouseLeave={() => setHovered(null)}
                      className="flex w-full items-center gap-2 rounded-btn px-3 py-2 text-left text-xs text-slate-200 transition-colors hover:bg-white/6 hover:text-white"
                    >
                      {isAi ? (
                        <Zap size={10} className="shrink-0 text-accent" />
                      ) : (
                        <span className="h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                      )}
                      <span className="flex-1">{action}</span>
                      {isAi && (
                        <span className="text-[9px] font-semibold text-accent/70 uppercase tracking-wider">
                          AI
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
