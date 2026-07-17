"use client";

/**
 * ContextBanner — temporary dismissible banner shown when the user lands
 * via a deep link (e.g. "Opened from AI Executive Summary").
 *
 * Props:
 *   source   string | null  — key from DEEP_LINK_SOURCES, or null to hide
 *   onDismiss () => void
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { DEEP_LINK_SOURCES } from "@/lib/deepLink";

const AUTO_DISMISS_MS = 3000;

export default function ContextBanner({ source, onDismiss }) {
  const label = DEEP_LINK_SOURCES[source] || source;

  // Auto-dismiss after 3 s
  useEffect(() => {
    if (!source) return;
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [source, onDismiss]);

  return (
    <AnimatePresence>
      {source && (
        <motion.div
          key="context-banner"
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2.5 rounded-card border border-accent/25 bg-accent/10 px-4 py-2.5"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/20">
            <Sparkles size={11} className="text-accent" />
          </div>
          <p className="flex-1 text-[12px] font-medium text-accent-light">
            Opened from{" "}
            <span className="font-semibold text-accent">{label}</span>
          </p>
          <button
            onClick={onDismiss}
            className="flex h-5 w-5 items-center justify-center rounded-md text-accent/60 transition-colors hover:bg-accent/10 hover:text-accent"
            aria-label="Dismiss"
          >
            <X size={11} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
