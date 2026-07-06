"use client";

import { useCards } from "@/lib/useCards";

export default function BusinessMemoryPage() {
  const { cards, loading } = useCards();
  const done = cards
    .filter((c) => c.status === "Done")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Business Memory</h1>
        <p className="mt-1 text-sm text-muted">
          Everything ActionDesk has helped you resolve, kept for reference.
        </p>
      </div>

      {loading && <p className="text-sm text-muted">Loading…</p>}

      {!loading && done.length === 0 && (
        <div className="rounded-card border border-border bg-card p-8 text-center text-sm text-muted">
          Nothing resolved yet. Mark actions done from the Action Center and they'll show up here.
        </div>
      )}

      <div className="space-y-3">
        {done.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-card border border-border bg-card px-5 py-4"
          >
            <div>
              <p className="text-sm text-slate-200">{c.title}</p>
              <p className="text-xs text-muted">
                {c.category} · via {c.source}
              </p>
            </div>
            <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-medium text-success">
              Resolved
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
