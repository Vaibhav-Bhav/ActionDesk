"use client";

import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useCards } from "@/lib/useCards";
import ActionCard2 from "@/components/action/ActionCard2";
import { ActionCardSkeleton } from "@/components/ActionCard";
import { CATEGORIES, PRIORITIES } from "@/lib/schema";
import { SlidersHorizontal, Inbox } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import ContextBanner from "@/components/ui/ContextBanner";
import { parseDeepLink } from "@/lib/deepLink";

// ── Inner component reads useSearchParams() — must be in a Suspense boundary
function ActionCenterInner() {
  const { cards, loading, updateCard } = useCards();
  const searchParams = useSearchParams();

  // ── Parse deep-link intent once on mount ────────────────────────
  const intent = useMemo(() => parseDeepLink(searchParams), [searchParams]);

  // ── Filters — seeded from deep-link params ──────────────────────
  const [category, setCategory] = useState(intent.category || "All");
  const [priority, setPriority] = useState(intent.priority || "All");
  const [status,   setStatus]   = useState("Pending");

  // ── Deep-link state ─────────────────────────────────────────────
  const [bannerSource,   setBannerSource]   = useState(intent.from || null);
  const [highlightedId,  setHighlightedId]  = useState(intent.highlight ? intent.cardId : null);

  // Ref map: cardId → DOM element, so we can scroll to it
  const cardRefs = useRef({});

  // ── Filter logic ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return cards.filter((c) => {
      // When a company deep-link is in effect and no cardId, restrict by company
      if (intent.company && !intent.cardId && c.company !== intent.company) return false;
      if (category !== "All" && c.category !== category) return false;
      if (priority !== "All" && c.priority !== priority) return false;
      if (status !== "All" && c.status !== status) return false;
      return true;
    });
  }, [cards, category, priority, status, intent.company, intent.cardId]);

  const activeFilters =
    [category, priority].filter((f) => f !== "All").length + (status === "Pending" ? 0 : 1);

  // ── Scroll + highlight on first render after cards load ─────────
  const didScroll = useRef(false);

  useEffect(() => {
    if (loading || didScroll.current) return;
    if (!intent.cardId && !intent.company) return;

    // Give the DOM a tick to render the cards
    const t = setTimeout(() => {
      const targetId = intent.cardId;

      if (targetId && cardRefs.current[targetId]) {
        cardRefs.current[targetId].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        didScroll.current = true;
      } else if (intent.company) {
        // Scroll to the first card matching the company
        const match = cards.find(
          (c) => c.company === intent.company && c.status !== "Done"
        );
        if (match && cardRefs.current[match.id]) {
          cardRefs.current[match.id].scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          setHighlightedId(match.id);
          didScroll.current = true;
        }
      }
    }, 300);

    return () => clearTimeout(t);
  }, [loading, cards, intent]);

  // ── Clear highlight after animation completes (2 s) ─────────────
  useEffect(() => {
    if (!highlightedId) return;
    const t = setTimeout(() => setHighlightedId(null), 2000);
    return () => clearTimeout(t);
  }, [highlightedId]);

  // ── Banner dismiss ───────────────────────────────────────────────
  const dismissBanner = useCallback(() => setBannerSource(null), []);

  return (
    <div className="space-y-6">
      {/* ── Context Banner ──────────────────────────────────────── */}
      <ContextBanner source={bannerSource} onDismiss={dismissBanner} />

      <div>
        <h1 className="text-xl font-bold text-white">Action Center</h1>
        <p className="mt-1 text-sm text-muted">Your executive operations console. Every action, from every source.</p>
      </div>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <SlidersHorizontal size={13} />
          <span>Filters</span>
          {activeFilters > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
              {activeFilters}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <FilterField label="Category">
            <Select value={category} onChange={setCategory} options={["All", ...CATEGORIES]} />
          </FilterField>
          <FilterField label="Priority">
            <Select value={priority} onChange={setPriority} options={["All", ...PRIORITIES]} />
          </FilterField>
          <FilterField label="Status">
            <Select value={status} onChange={setStatus} options={["All", "Pending", "In Progress", "Done"]} />
          </FilterField>

          {(category !== "All" || priority !== "All" || status !== "Pending") && (
            <button
              onClick={() => { setCategory("All"); setPriority("All"); setStatus("Pending"); }}
              className="mb-2 text-xs text-muted hover:text-slate-200 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Loading skeletons ────────────────────────────────────── */}
      {loading && (
        <div className="columns-1 lg:columns-2 gap-5">
          <div className="break-inside-avoid mb-5"><ActionCardSkeleton /></div>
          <div className="break-inside-avoid mb-5"><ActionCardSkeleton /></div>
          <div className="break-inside-avoid mb-5"><ActionCardSkeleton /></div>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={<Inbox size={24} />}
          title="Nothing here"
          message="Try a different filter, or import something from the Imports page."
        />
      )}

      {/* ── Cards ────────────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div className="columns-1 lg:columns-2 gap-5 pt-2">
          {filtered.map((card) => (
            <div
              key={card.id}
              className="break-inside-avoid mb-5"
              ref={(el) => { if (el) cardRefs.current[card.id] = el; }}
            >
              <ActionCard2
                card={card}
                onUpdate={updateCard}
                highlighted={highlightedId === card.id}
                defaultExpanded={
                  (highlightedId === card.id || intent.cardId === card.id) &&
                  intent.expandDetails
                }
                pulseAI={
                  (highlightedId === card.id || intent.cardId === card.id) &&
                  intent.pulseAI
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page export wraps the inner component in Suspense (Next.js 14 requirement)
export default function ActionCenterPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Action Center</h1>
          <p className="mt-1 text-sm text-muted">Your executive operations console. Every action, from every source.</p>
        </div>
        <div className="columns-1 lg:columns-2 gap-5">
          <div className="break-inside-avoid mb-5"><ActionCardSkeleton /></div>
          <div className="break-inside-avoid mb-5"><ActionCardSkeleton /></div>
        </div>
      </div>
    }>
      <ActionCenterInner />
    </Suspense>
  );
}

function FilterField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</span>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-input border border-border bg-card px-3 py-2 text-sm text-slate-200 outline-none transition-colors hover:border-accent/30 focus-visible:outline-accent"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}