"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, BrainCircuit } from "lucide-react";
import { CATEGORY_STYLE } from "@/lib/demoData";

/**
 * highlightMatch — wraps matching text segments in <mark> elements.
 */
export function highlightMatch(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="rounded bg-accent/25 text-white not-italic">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/**
 * SearchResults — grouped results (Actions + Business Memory) with highlighted matches.
 * Searches across: title, summary, company, category, source, recommended_action,
 *   businessContext, why_it_matters, learning, recommendation, tags.
 *
 * Props:
 *   query    string
 *   cards    ActionCard[]
 *   onClose  () => void
 */
export default function SearchResults({ query, cards, onClose }) {
  const router = useRouter();

  const { actions, memories } = useMemo(() => {
    if (!query.trim()) return { actions: [], memories: [] };

    const q = query.toLowerCase();

    function matches(card) {
      return [
        card.title,
        card.summary,
        card.company,
        card.category,
        card.source,
        card.recommended_action,
        card.businessContext,
        card.why_it_matters,
        card.learning,
        card.recommendation,
        ...(card.tags ?? []),
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q));
    }

    const matched  = cards.filter(matches);
    const actions  = matched.filter((c) => c.status !== "Done");
    const memories = matched.filter((c) => c.status === "Done");

    return { actions, memories };
  }, [query, cards]);

  const hasResults = actions.length + memories.length > 0;

  if (!query.trim()) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-muted">Start typing to search across all actions and business memory.</p>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-muted">No results found for &quot;{query}&quot;</p>
        <p className="mt-1 text-xs text-subtle">Try searching by company, category, or tag.</p>
      </div>
    );
  }

  function navigate(path) {
    onClose();
    router.push(path);
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/40">
      {/* Active Actions group */}
      {actions.length > 0 && (
        <ResultGroup
          icon={FileText}
          label="Actions"
          count={actions.length}
          iconColor="text-accent"
        >
          {actions.map((card) => (
            <ResultRow
              key={card.id}
              card={card}
              query={query}
              onClick={() => navigate("/action-center")}
            />
          ))}
        </ResultGroup>
      )}

      {/* Business Memory group */}
      {memories.length > 0 && (
        <ResultGroup
          icon={BrainCircuit}
          label="Business Memory"
          count={memories.length}
          iconColor="text-purple-400"
        >
          {memories.map((card) => (
            <ResultRow
              key={card.id}
              card={card}
              query={query}
              onClick={() => navigate("/business-memory")}
            />
          ))}
        </ResultGroup>
      )}
    </div>
  );
}

function ResultGroup({ icon: Icon, label, count, iconColor, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.015]">
        <Icon size={12} className={iconColor} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</span>
        <span className="ml-auto text-[10px] text-subtle">{count}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function ResultRow({ card, query, onClick }) {
  const catStyle = CATEGORY_STYLE[card.category] ?? "bg-white/5 text-muted border-white/10";

  // Find the best matching snippet to show (beyond title/company)
  const snippetFields = [
    card.summary,
    card.businessContext,
    card.learning,
    card.recommendation,
  ].filter(Boolean);

  const q = query.toLowerCase();
  const matchingSnippet = snippetFields.find((f) => f.toLowerCase().includes(q));

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
    >
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="truncate text-[13px] font-medium text-slate-200 group-hover:text-white transition-colors">
          {highlightMatch(card.title, query)}
        </p>
        {card.company && (
          <p className="text-[11px] text-muted">
            {highlightMatch(card.company, query)}
          </p>
        )}
        {matchingSnippet && (
          <p className="truncate text-[11px] text-subtle">
            {highlightMatch(matchingSnippet, query)}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${catStyle}`}>
          {card.category}
        </span>
        <ArrowRight
          size={12}
          className="text-muted opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
        />
      </div>
    </button>
  );
}
