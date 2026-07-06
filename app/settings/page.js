"use client";

import { useState } from "react";
import { useCards } from "@/lib/useCards";

export default function SettingsPage() {
  const { refresh } = useCards();
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState(null);

  async function resetData() {
    setResetting(true);
    try {
      await fetch("/api/cards", { method: "DELETE" });
      await refresh();
      setMessage("Demo data reset.");
    } finally {
      setResetting(false);
      setTimeout(() => setMessage(null), 2500);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-muted">Workspace and integration settings.</p>
      </div>

      <div className="rounded-card border border-border bg-card p-5">
        <p className="text-sm font-medium text-white">Workspace</p>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Name</span>
            <span className="text-slate-200">Furniture Business</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Plan</span>
            <span className="text-slate-200">Hackathon MVP</span>
          </div>
        </div>
      </div>

      <div className="rounded-card border border-border bg-card p-5">
        <p className="text-sm font-medium text-white">AI Extraction (Groq)</p>
        <p className="mt-2 text-xs text-muted">
          Extraction calls run server-side using <code className="text-slate-300">GROQ_API_KEY</code>{" "}
          from your <code className="text-slate-300">.env.local</code> file. The key is never sent to
          the browser. See the README for setup.
        </p>
      </div>

      <div className="rounded-card border border-border bg-card p-5">
        <p className="text-sm font-medium text-white">Demo Data</p>
        <p className="mt-2 text-xs text-muted">
          Resets the in-memory store back to the seeded sample actions. Useful before a demo.
        </p>
        <button
          onClick={resetData}
          disabled={resetting}
          className="mt-3 rounded-btn border border-border px-4 py-2 text-xs font-medium text-slate-200 hover:bg-white/5 disabled:opacity-60"
        >
          Reset Demo Data
        </button>
        {message && <p className="mt-2 text-xs text-accent">{message}</p>}
      </div>
    </div>
  );
}
