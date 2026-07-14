"use client";

import {
  ExecutiveInsights,
  BusinessRelationships,
  BusinessSnapshot,
  MiniTrends,
  PatternDiscovery,
  StrategicPriorities,
} from "@/components/intelligence";

import {
  executiveInsights,
  businessRelationships,
  businessSnapshot,
  miniTrends,
  aiPatterns,
  strategicPriorities,
} from "@/lib/intelligenceData";

export default function InsightsPage() {
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
      <ExecutiveInsights data={executiveInsights} />

      {/* Section 2 — Business Relationships */}
      <BusinessRelationships data={businessRelationships} />

      {/* Section 3 — Business Snapshot */}
      <BusinessSnapshot data={businessSnapshot} />

      {/* Section 4 — Mini Trends */}
      <MiniTrends data={miniTrends} />

      {/* Section 5 — AI Pattern Discovery */}
      <PatternDiscovery data={aiPatterns} />

      {/* Section 6 — Today's Strategic Priorities */}
      <StrategicPriorities data={strategicPriorities} />
    </div>
  );
}
