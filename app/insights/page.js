"use client";

import { useMemo } from "react";
import { useCards } from "@/lib/useCards";
import { CATEGORIES } from "@/lib/schema";

export default function InsightsPage() {
  const { cards, loading } = useCards();

  const bySource = useMemo(() => countBy(cards, "source"), [cards]);
  const byCategory = useMemo(() => countBy(cards, "category"), [cards]);
  const pendingPayments = cards.filter(
    (c) => ["Invoice", "Payment"].includes(c.category) && c.status !== "Done"
  );
  const upcoming = cards
    .filter((c) => c.deadline && c.status !== "Done")
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  const maxCategory = Math.max(1, ...Object.values(byCategory));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Business Insights</h1>
        <p className="mt-1 text-sm text-muted">Patterns across everything that's come in.</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-card border border-border bg-card p-5">
            <p className="text-sm font-medium text-white">Actions by Category</p>
            <div className="mt-4 space-y-3">
              {CATEGORIES.map((cat) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs text-muted">
                    <span>{cat}</span>
                    <span>{byCategory[cat] || 0}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-white/5">
                    <div
                      className="h-1.5 rounded-full bg-accent"
                      style={{ width: `${((byCategory[cat] || 0) / maxCategory) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-border bg-card p-5">
            <p className="text-sm font-medium text-white">Where things are coming from</p>
            <div className="mt-4 space-y-2">
              {Object.entries(bySource).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{source}</span>
                  <span className="text-muted">{count}</span>
                </div>
              ))}
              {Object.keys(bySource).length === 0 && (
                <p className="text-sm text-muted">No imports yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-card border border-border bg-card p-5">
            <p className="text-sm font-medium text-white">Pending Payments</p>
            <p className="mt-1 text-xs text-muted">{pendingPayments.length} invoice(s)/payment(s) awaiting action.</p>
            <div className="mt-4 space-y-2">
              {pendingPayments.map((c) => (
                <div key={c.id} className="flex justify-between text-sm">
                  <span className="text-slate-300">{c.title}</span>
                  <span className="text-muted">{c.deadline || "no date"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-border bg-card p-5">
            <p className="text-sm font-medium text-white">Upcoming Deadlines</p>
            <div className="mt-4 space-y-2">
              {upcoming.map((c) => (
                <div key={c.id} className="flex justify-between text-sm">
                  <span className="text-slate-300">{c.title}</span>
                  <span className="text-muted">{c.deadline}</span>
                </div>
              ))}
              {upcoming.length === 0 && <p className="text-sm text-muted">Nothing on the horizon.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function countBy(list, key) {
  return list.reduce((acc, item) => {
    const k = item[key];
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}
