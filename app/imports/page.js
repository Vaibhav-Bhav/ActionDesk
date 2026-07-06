"use client";

import { useState } from "react";
import { FileText, Mic, MessageSquareText, Loader2 } from "lucide-react";
import { useCards } from "@/lib/useCards";
import SyncButtons from "@/components/SyncButtons";
import ActionCard from "@/components/ActionCard";

export default function ImportsPage() {
  const { cards, addCards, updateCard } = useCards();
  const recentImports = cards.slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Imports</h1>
        <p className="mt-1 text-sm text-muted">
          Bring in an email, WhatsApp message, invoice, or voice note. Everything becomes an
          Action Card.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-border bg-card p-5">
          <p className="text-sm font-medium text-white">Sync a channel</p>
          <p className="mt-1 text-xs text-muted">Connector is simulated; extraction is real.</p>
          <div className="mt-4">
            <SyncButtons onSynced={addCards} />
          </div>
        </div>

        <PasteText onCreated={(card) => addCards([card])} />
        <InvoiceUpload onCreated={(card) => addCards([card])} />
        <VoiceNote onCreated={(card) => addCards([card])} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-white">Just imported</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {recentImports.map((card) => (
            <ActionCard key={card.id} card={card} onUpdate={updateCard} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Panel({ icon: Icon, title, hint, children }) {
  return (
    <div className="rounded-card border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-accent" />
        <p className="text-sm font-medium text-white">{title}</p>
      </div>
      <p className="mt-1 text-xs text-muted">{hint}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function PasteText({ onCreated }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source: "Manual" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      onCreated(data.card);
      setText("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel icon={MessageSquareText} title="Paste an email or message" hint="Runs through the real Groq extraction pipeline.">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Paste the raw text of an email, WhatsApp message, or note…"
        className="w-full rounded-input border border-border bg-white/[0.02] px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-muted focus-visible:outline-accent"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={submit}
          disabled={loading || !text.trim()}
          className="flex items-center gap-2 rounded-btn bg-accent px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          Extract Action
        </button>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    </Panel>
  );
}

function InvoiceUpload({ onCreated }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload-invoice", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onCreated(data.card);
      setFile(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel icon={FileText} title="Upload an invoice" hint="Accepts PDF or plain text files.">
      <input
        type="file"
        accept=".pdf,.txt"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full text-xs text-muted file:mr-3 file:rounded-btn file:border-0 file:bg-white/5 file:px-3 file:py-2 file:text-xs file:text-slate-200"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={submit}
          disabled={loading || !file}
          className="flex items-center gap-2 rounded-btn bg-accent px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          Extract Invoice
        </button>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    </Panel>
  );
}

function VoiceNote({ onCreated }) {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    if (!transcript.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("transcript", transcript);
      const res = await fetch("/api/upload-voice", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Processing failed");
      onCreated(data.card);
      setTranscript("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel
      icon={Mic}
      title="Voice note"
      hint="Paste a transcript for the demo (real audio upload uses Groq Whisper)."
    >
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        rows={3}
        placeholder="e.g. Remind me to visit the new showroom site Saturday morning with the contractor…"
        className="w-full rounded-input border border-border bg-white/[0.02] px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-muted focus-visible:outline-accent"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={submit}
          disabled={loading || !transcript.trim()}
          className="flex items-center gap-2 rounded-btn bg-accent px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          Process Voice Note
        </button>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    </Panel>
  );
}
