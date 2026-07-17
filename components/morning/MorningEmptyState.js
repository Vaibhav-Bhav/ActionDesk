"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Plus } from "lucide-react";
import { ImportModal } from "@/components/ui/Modal";
import { useState } from "react";

/**
 * MorningEmptyState — shown when no cards exist.
 */
export default function MorningEmptyState() {
  const router = useRouter();
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface px-8 py-20 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
          <CheckCircle2 size={28} className="text-success" />
        </div>

        <h2 className="mt-5 text-xl font-bold text-white">
          Everything looks great.
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
          Your AI Chief of Staff didn&apos;t find any urgent work today. Import your
          business data to get started.
        </p>

        <button
          onClick={() => setImportOpen(true)}
          className="mt-8 flex items-center gap-2 rounded-btn bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-light hover:shadow-glow-sm active:scale-95"
        >
          <Plus size={15} />
          Import Business Data
        </button>
      </motion.div>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
