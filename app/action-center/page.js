"use client";

import { useMemo, useState } from "react";
import { useCards } from "@/lib/useCards";
import ActionCard from "@/components/ActionCard";
import { CATEGORIES, PRIORITIES } from "@/lib/schema";

export default function ActionCenterPage() {
  const { cards, loading, updateCard } = useCards();
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [status, setStatus] = useState("Pending");

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      if (category !== "All" && c.category !== category) return false;
      if (priority !== "All" && c.priority !== priority) return false;
      if (status !== "All" && c.status !== status) return false;
      return true;
    });
  }, [cards, category, priority, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Action Center</h1>
        <p className="mt-1 text-sm text-muted">Every action, from every source, in one place.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={category} onChange={setCategory} options={["All", ...CATEGORIES]} />
        <Select value={priority} onChange={setPriority} options={["All", ...PRIORITIES]} />
        <Select value={status} onChange={setStatus} options={["All", "Pending", "In Progress", "Done"]} />
      </div>

      {loading && <p className="text-sm text-muted">Loading actions…</p>}

      {!loading && filtered.length === 0 && (
        <div className="rounded-card border border-border bg-card p-8 text-center text-sm text-muted">
          Nothing here. Try a different filter, or import something from the Imports page.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((card) => (
          <ActionCard key={card.id} card={card} onUpdate={updateCard} />
        ))}
      </div>
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-input border border-border bg-card px-3 py-2 text-sm text-slate-200 outline-none focus-visible:outline-accent"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
