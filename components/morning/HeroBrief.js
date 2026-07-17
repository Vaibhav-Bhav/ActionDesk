"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import BusinessHealth from "./BusinessHealth";
import Highlights from "./Highlights";
import SyncButtons from "@/components/SyncButtons";
import { generateBusinessHealth } from "@/lib/businessHealth";

/**
 * HeroBrief — full-width AI Executive Brief hero.
 *
 * Props:
 *   cards       ActionCard[]
 *   onSynced    (newCards) => void
 *   greeting    string
 *   estMinutes  number
 */
export default function HeroBrief({ cards, onSynced, greeting, estMinutes }) {
  const health = generateBusinessHealth(cards);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-glow-sm"
    >
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      {/* Very subtle ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 30% 0%, #4F73FF 0%, transparent 70%)",
        }}
      />

      <div className="relative p-7 sm:p-8">
        {/* ── Main row ─────────────────────────────────────── */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

          {/* LEFT: Brief */}
          <div className="flex-1 min-w-0">
            {/* Label */}
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/15">
                <Sparkles size={12} className="text-accent" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
                AI Morning Brief
              </span>
            </div>

            {/* Greeting */}
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {greeting}, Raj 👋
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              I&apos;ve reviewed today&apos;s business activity.
            </p>

            {/* Highlights chips */}
            {cards.length > 0 && (
              <div className="mt-5">
                <Highlights cards={cards} />
              </div>
            )}

            {/* Business Health */}
            <div className="mt-6 border-t border-border pt-5">
              <BusinessHealth health={health} />
            </div>
          </div>

          {/* RIGHT: Summary card */}
          <div className="flex shrink-0 flex-col gap-4 lg:w-52">
            {/* Today's Work estimate */}
            {estMinutes > 0 && (
              <div className="rounded-xl border border-border bg-elevated px-5 py-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                  Today&apos;s Work
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-white">
                  ~{estMinutes}
                  <span className="ml-1 text-lg font-medium text-muted">min</span>
                </p>
                <p className="mt-1 text-[11px] text-muted">Estimated focus time</p>
              </div>
            )}

            {/* Quick status row */}
            <div className="rounded-xl border border-border bg-elevated px-4 py-3 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-2">
                Quick Status
              </p>
              <StatRow label="Total Actions" value={cards.length} />
              <StatRow
                label="Pending"
                value={cards.filter((c) => c.status !== "Done").length}
              />
              <StatRow
                label="Completed"
                value={cards.filter((c) => c.status === "Done").length}
                accent
              />
            </div>
          </div>
        </div>

        {/* ── Footer: Sync ──────────────────────────────────── */}
        <div className="mt-7 border-t border-border pt-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Sync Sources
          </p>
          <SyncButtons onSynced={onSynced} />
        </div>
      </div>
    </motion.section>
  );
}

function StatRow({ label, value, accent = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-muted">{label}</span>
      <span className={`text-[13px] font-semibold tabular-nums ${accent ? "text-success" : "text-slate-200"}`}>
        {value}
      </span>
    </div>
  );
}
