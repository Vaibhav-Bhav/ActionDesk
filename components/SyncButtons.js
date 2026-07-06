"use client";

import { useState } from "react";
import { Mail, MessageCircle, Loader2 } from "lucide-react";

export default function SyncButtons({ onSynced }) {
  const [loading, setLoading] = useState(null); // "gmail" | "whatsapp" | null
  const [error, setError] = useState(null);

  async function sync(kind) {
    setLoading(kind);
    setError(null);
    try {
      const res = await fetch(`/api/sync-${kind}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      onSynced?.(data.cards || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => sync("gmail")}
        disabled={loading !== null}
        className="flex items-center gap-2 rounded-btn border border-border bg-card px-4 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-60"
      >
        {loading === "gmail" ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
        Sync Gmail
      </button>
      <button
        onClick={() => sync("whatsapp")}
        disabled={loading !== null}
        className="flex items-center gap-2 rounded-btn border border-border bg-card px-4 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-60"
      >
        {loading === "whatsapp" ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <MessageCircle size={15} />
        )}
        Sync WhatsApp
      </button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
