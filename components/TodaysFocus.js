const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };

export default function TodaysFocus({ cards }) {
  const top = [...cards]
    .filter((c) => c.status !== "Done")
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
    .slice(0, 3);

  return (
    <div className="rounded-card border border-border bg-card p-5">
      <h2 className="text-sm font-medium text-white">Today&apos;s Focus</h2>
      <div className="mt-4 space-y-3">
        {top.length === 0 && (
          <p className="text-sm text-muted">Nothing urgent — you&apos;re caught up.</p>
        )}
        {top.map((card, i) => (
          <div key={card.id} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
              {i + 1}
            </span>
            <div>
              <p className="text-sm text-slate-200">{card.title}</p>
              <p className="text-xs text-muted">{card.recommended_action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
