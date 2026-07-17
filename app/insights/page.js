"use client";

import { useIntelligence } from "@/lib/useIntelligence";
import {
  ExecutiveInsights,
  BusinessRelationships,
  BusinessSnapshot,
  MiniTrends,
  PatternDiscovery,
  StrategicPriorities,
} from "@/components/intelligence";
import IntelligenceBanner from "@/components/ui/IntelligenceBanner";
import TrustBlock from "@/components/ui/TrustBlock";

export default function InsightsPage() {
  const { bi, confidence, cards, loading } = useIntelligence();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-card border border-border bg-surface animate-pulse" />
        ))}
      </div>
    );
  }

  if (!bi) {
    return (
      <div className="rounded-card border border-border bg-surface px-8 py-16 text-center">
        <p className="text-sm text-muted">No intelligence data available yet.</p>
        <p className="mt-1 text-xs text-muted">Import business communications to get started.</p>
      </div>
    );
  }

  const companies = bi.metrics?.companies ?? 0;
  const total     = bi.metrics?.totalActions ?? 0;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-white">Business Intelligence</h1>
        <p className="mt-1 text-sm text-muted">
          AI-powered strategy insights across your entire business.
        </p>
      </div>

      {/* Intelligence Banner */}
      <IntelligenceBanner
        title="Strategic analysis from live business data"
        subtitle="Business Intelligence Engine"
        variant="insights"
        stats={[
          { label: "action cards", value: total },
          { label: "customers",    value: companies },
          { label: "confidence",   value: `${confidence.score}%` },
        ]}
      />

      {/* Section 1 — Executive Insights */}
      <ExecutiveInsights data={bi.executiveInsights} />

      {/* Section 2 — Business Relationships */}
      <BusinessRelationships data={bi.businessRelationships} />

      {/* Section 3 — Business Snapshot */}
      <BusinessSnapshot data={bi.businessSnapshot} />

      {/* Section 4 — Mini Trends */}
      <MiniTrends data={bi.miniTrends} />

      {/* Section 5 — AI Pattern Discovery */}
      <PatternDiscovery data={bi.aiPatterns} />

      {/* Section 6 — Today's Strategic Priorities */}
      <StrategicPriorities data={bi.strategicPriorities} />

      {/* Trust Block at bottom */}
      <div className="rounded-card border border-border bg-surface p-5">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted">
          Intelligence Sources
        </p>
        <TrustBlock confidence={confidence} />
      </div>
    </div>
  );
}
