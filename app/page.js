"use client";

import { useCards } from "@/lib/useCards";
import MorningLoader        from "@/components/morning/MorningLoader";
import AiExecutiveSummary   from "@/components/morning/AiExecutiveSummary";
import HeroBrief            from "@/components/morning/HeroBrief";
import BusinessPulse        from "@/components/morning/BusinessPulse";
import TodaysFocus          from "@/components/morning/TodaysFocus";
import RecentTimeline       from "@/components/morning/RecentTimeline";
import QuickWins            from "@/components/morning/QuickWins";
import AISuggestions        from "@/components/morning/AISuggestions";
import MorningEmptyState    from "@/components/morning/MorningEmptyState";

const FOCUS_RANK = { High: 0, Medium: 1, Low: 2 };

export default function DashboardPage() {
  const { cards, loading, addCards } = useCards();

  // ── Derived stats ─────────────────────────────────────────
  const pending    = cards.filter((c) => c.status !== "Done");
  const urgent     = pending.filter((c) => c.priority === "High").length;
  const estMinutes = urgent * 8 + Math.max(0, pending.length - urgent) * 4;

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // ── Show loader while data is fetching ────────────────────
  return (
    <MorningLoader loading={loading}>
      {cards.length === 0 ? (
        <MorningEmptyState />
      ) : (
        <div className="space-y-6">
          {/* ── AI Executive Summary ──────────────────────────── */}
          <AiExecutiveSummary cards={cards} />

          {/* ── Hero ─────────────────────────────────────────── */}
          <HeroBrief
            cards={cards}
            onSynced={addCards}
            greeting={greeting}
            estMinutes={estMinutes}
          />

          {/* ── Business Pulse (metric cards) ────────────────── */}
          <BusinessPulse cards={cards} />

          {/* ── Main content: timeline + right column ─────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* Left — 2/3 width */}
            <div className="space-y-6 lg:col-span-2">
              {/* Today's Focus */}
              <div className="rounded-card border border-border bg-surface p-5">
                <TodaysFocus cards={cards} />
              </div>

              {/* Recent Timeline */}
              <div className="rounded-card border border-border bg-surface p-5">
                <RecentTimeline cards={cards} />
              </div>
            </div>

            {/* Right — 1/3 width */}
            <div className="space-y-4">
              <QuickWins cards={cards} />
              <AISuggestions cards={cards} />
            </div>
          </div>
        </div>
      )}
    </MorningLoader>
  );
}
