"use client";

import { useMemo } from "react";
import { useCards } from "@/lib/useCards";
import { generateBusinessIntelligence } from "@/lib/businessIntelligence";

import {
  ExecutiveInsights,
  BusinessRelationships,
  BusinessSnapshot,
  MiniTrends,
  PatternDiscovery,
  StrategicPriorities,
} from "@/components/intelligence";

export default function InsightsPage() {
  const { cards, loading } = useCards();

  const intelligence = useMemo(
    () => generateBusinessIntelligence(cards),
    [cards]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-muted animate-pulse">
          Generating business intelligence…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-white">Business Intelligence</h1>
        <p className="mt-1 text-sm text-muted">
          AI-powered strategy insights across your entire business.
        </p>
      </div>

      {/* Section 1 — Executive Insights (Hero) */}
      <ExecutiveInsights data={intelligence.executiveInsights} />

      {/* Section 2 — Business Relationships */}
      <BusinessRelationships data={intelligence.businessRelationships} />

      {/* Section 3 — Business Snapshot */}
      <BusinessSnapshot data={intelligence.businessSnapshot} />

      {/* Section 4 — Mini Trends */}
      <MiniTrends data={intelligence.miniTrends} />

      {/* Section 5 — AI Pattern Discovery */}
      <PatternDiscovery data={intelligence.aiPatterns} />

      {/* Section 6 — Today's Strategic Priorities */}
      <StrategicPriorities data={intelligence.strategicPriorities} />
    </div>
  );
}
