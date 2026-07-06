function timeLabel(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function RecentActivity({ cards }) {
  const recent = [...cards]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div className="rounded-card border border-border bg-card p-5">
      <h2 className="text-sm font-medium text-white">Recent Activity</h2>
      <div className="mt-4 space-y-4">
        {recent.map((card, i) => (
          <div key={card.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {i < recent.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-border" />}
            </div>
            <div className="-mt-1 pb-1">
              <p className="text-xs text-muted">{timeLabel(card.createdAt)}</p>
              <p className="text-sm text-slate-200">
                Imported <span className="text-slate-400">{card.source}</span> · {card.title}
              </p>
            </div>
          </div>
        ))}
        {recent.length === 0 && <p className="text-sm text-muted">No activity yet.</p>}
      </div>
    </div>
  );
}
