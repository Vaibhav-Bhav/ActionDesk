/**
 * useIntelligence — shared React hook for all intelligence-powered pages.
 *
 * Replaces per-page calls to generateBusinessIntelligence(cards) with
 * a single enriched context that includes confidence and relationship learnings.
 *
 * Usage:
 *   const { bi, confidence, relationshipLearnings, cards, loading } = useIntelligence();
 */

import { useMemo } from "react";
import { useCards } from "./useCards";
import { buildIntelligenceContext } from "./intelligenceEngine";

export function useIntelligence() {
  const { cards, loading, addCards } = useCards();

  const context = useMemo(
    () => (cards.length > 0 ? buildIntelligenceContext(cards) : null),
    // Recompute only when card count or completion state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cards.length, cards.filter((c) => c.status === "Done").length]
  );

  // Expose top-level BI fields directly for convenience
  const bi                  = context;
  const confidence          = context?.confidence ?? { score: 0, present: [], missing: [] };
  const relationshipLearnings = context?.relationshipLearnings ?? {};

  return {
    bi,              // full intelligence context (includes all BI fields)
    confidence,      // { score, present, missing }
    relationshipLearnings, // per-company { learnings, trend }
    cards,
    loading,
    addCards,
  };
}
