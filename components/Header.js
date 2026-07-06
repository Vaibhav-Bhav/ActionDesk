"use client";

import { Search, Bell } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-8">
      <div className="flex w-80 items-center gap-2 rounded-input border border-border bg-card px-3 py-2 text-sm text-muted">
        <Search size={15} />
        <input
          placeholder="Search actions, contacts, invoices..."
          className="w-full bg-transparent outline-none placeholder:text-muted"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          aria-label="Notifications"
          className="relative rounded-btn p-2 text-muted hover:bg-white/5 hover:text-slate-200"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
          R
        </div>
      </div>
    </header>
  );
}
