"use client";

import { useMemo, useState } from "react";
import { BrainCircuit, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useIntelligence } from "@/lib/useIntelligence";
import MemoryStats from "@/components/memory/MemoryStats";
import MemorySearch from "@/components/memory/MemorySearch";
import MemoryCard from "@/components/memory/MemoryCard";
import IntelligenceBanner from "@/components/ui/IntelligenceBanner";

export default function BusinessMemoryPage() {
  const { cards, loading } = useIntelligence();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const done = cards.filter((c) => c.status === "Done");

  const filtered = useMemo(() => {
    let result = done;

    if (filter === "customer") {
      result = result.filter((c) =>
        ["Customer Request", "Complaint", "Quotation", "Meeting"].includes(c.category)
      );
    } else if (filter === "supplier") {
      result = result.filter((c) =>
        ["Invoice", "Payment", "Purchase Order"].includes(c.category)
      );
    } else if (filter === "invoice") {
      result = result.filter((c) => c.category === "Invoice");
    } else if (filter === "complaint") {
      result = result.filter((c) => c.category === "Complaint");
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((c) =>
        [c.title, c.summary, c.company, c.learning, c.recommendation, ...(c.tags ?? [])]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [done, query, filter]);

  // Banner stats derived from cards
  const companies     = new Set(done.map((c) => c.company).filter(Boolean)).size;
  const learningsCount = done.filter((c) => c.learning).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-white">Business Memory</h1>
        <p className="mt-1 text-sm text-muted">
          Institutional knowledge built from every resolved action.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-card border border-border bg-surface animate-pulse" />
          ))}
        </div>
      )}

      {!loading && (
        <>
          {/* Intelligence Banner */}
          <IntelligenceBanner
            title="Business Memory"
            subtitle="Institutional knowledge from resolved actions"
            variant="memory"
            stats={[
              { label: "memories", value: done.length },
              { label: "companies", value: companies },
              { label: "AI learnings", value: learningsCount || done.length },
            ]}
          />

          {/* Stats */}
          <MemoryStats cards={cards} />

          {/* Search + filters */}
          <MemorySearch
            query={query}
            onQuery={setQuery}
            filter={filter}
            onFilter={setFilter}
          />

          {/* Empty state — no resolved cards yet */}
          {done.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-card border border-border bg-surface px-8 py-16 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                <BrainCircuit size={26} className="text-accent/70" />
              </div>
              <h2 className="mt-5 text-base font-semibold text-white">
                Business Memory grows as you work.
              </h2>
              <p className="mt-2 mx-auto max-w-sm text-sm leading-relaxed text-muted">
                Every action you complete becomes institutional knowledge — learnings, patterns,
                and AI recommendations saved automatically.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
                <span>Mark actions done in</span>
                <a href="/action-center" className="inline-flex items-center gap-1 text-accent hover:underline font-medium">
                  Action Center <ArrowRight size={11} />
                </a>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-2 text-[11px] text-muted">
                {["Import communication", "→", "AI extracts action", "→", "You resolve it", "→", "Knowledge saved here"].map((step, i) => (
                  <span key={i} className={step === "→" ? "text-border" : "font-medium text-slate-400"}>
                    {step}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* No search results */}
          {done.length > 0 && filtered.length === 0 && (
            <div className="rounded-card border border-border bg-surface px-8 py-12 text-center">
              <CheckCircle2 size={22} className="mx-auto mb-3 text-muted/40" />
              <p className="text-sm text-muted">No memories match "{query}"</p>
            </div>
          )}

          {/* Memory cards — pass all cards so RelationshipLearnings can derive patterns */}
          {filtered.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs text-muted">
                {filtered.length} memor{filtered.length !== 1 ? "ies" : "y"} found
              </p>
              {filtered.map((card, i) => (
                <MemoryCard key={card.id} card={card} index={i} allCards={cards} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
