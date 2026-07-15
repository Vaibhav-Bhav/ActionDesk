"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  Download,
  RefreshCw,
  Check,
  Sparkles,
  FileText,
  AlertCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Modal Shell
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AiPreviewModal — reusable modal for previewing AI-generated artifacts.
 *
 * States: loading → preview → error
 * Actions: Copy, Download, Regenerate, Mark Done
 *
 * Props:
 *   open          boolean
 *   onClose       () => void
 *   card          ActionCard object
 *   actionType    string (e.g. "Draft Formal Quotation")
 *   onMarkDone    () => void — marks the card as Done
 */
export default function AiPreviewModal({ open, onClose, card, actionType, onMarkDone }) {
  const [artifact, setArtifact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    if (!card?.id || !actionType) return;
    setLoading(true);
    setError(null);
    setArtifact(null);

    try {
      const res = await fetch("/api/ai-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, actionType }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      setArtifact(data.artifact);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [card?.id, actionType]);

  // Trigger generation when modal opens
  const handleOpen = useCallback(() => {
    if (open && !artifact && !loading) {
      generate();
    }
  }, [open, artifact, loading, generate]);

  // Effect equivalent: trigger on open
  useState(() => {
    if (open) handleOpen();
  });

  function handleCopy() {
    if (!artifact) return;
    const text = artifactToPlainText(artifact);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    if (!artifact) return;
    const text = artifactToPlainText(artifact);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artifact.metadata?.quotationRef || "document"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleRegenerate() {
    setArtifact(null);
    setCopied(false);
    generate();
  }

  function handleMarkDone() {
    onMarkDone?.();
    onClose();
  }

  function handleClose() {
    setArtifact(null);
    setError(null);
    setCopied(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="ai-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(5,7,26,0.88)" }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            key="ai-modal-panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-dialog border border-border bg-elevated shadow-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-modal-title"
          >
            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-btn bg-accent/10">
                  <Sparkles size={14} className="text-accent" />
                </div>
                <div>
                  <h2 id="ai-modal-title" className="text-sm font-semibold text-white">
                    {actionType}
                  </h2>
                  <p className="text-[11px] text-muted mt-0.5">
                    {card?.company || card?.title || "AI Generated"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-btn p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-slate-200"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Body ────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading && <LoadingState />}
              {error && <ErrorState error={error} onRetry={handleRegenerate} />}
              {artifact && !loading && !error && (
                <ArtifactRenderer artifact={artifact} />
              )}
            </div>

            {/* ── Footer Actions ──────────────────────────────── */}
            {artifact && !loading && !error && (
              <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-3.5 shrink-0">
                <div className="flex items-center gap-2">
                  <ActionButton
                    icon={copied ? Check : Copy}
                    label={copied ? "Copied!" : "Copy"}
                    onClick={handleCopy}
                    accent={copied}
                  />
                  <ActionButton
                    icon={Download}
                    label="Download"
                    onClick={handleDownload}
                  />
                  <ActionButton
                    icon={RefreshCw}
                    label="Regenerate"
                    onClick={handleRegenerate}
                  />
                </div>
                <button
                  onClick={handleMarkDone}
                  className="flex items-center gap-1.5 rounded-btn bg-success/15 border border-success/30 px-3.5 py-1.5 text-xs font-semibold text-success transition-all hover:bg-success/25 active:scale-[0.97]"
                >
                  <Check size={12} />
                  Mark Done
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ActionButton({ icon: Icon, label, onClick, accent = false }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-btn border px-3 py-1.5 text-xs font-medium transition-all hover:bg-white/5 active:scale-[0.97] ${
        accent
          ? "border-success/30 text-success"
          : "border-border text-slate-300 hover:text-white"
      }`}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5 py-8">
      <div className="flex flex-col items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={20} className="text-accent" />
        </motion.div>
        <p className="text-sm font-medium text-slate-300 animate-pulse">
          Generating document…
        </p>
        <p className="text-xs text-muted">
          This usually takes 5–10 seconds
        </p>
      </div>
      {/* Skeleton preview */}
      <div className="space-y-3 mt-6">
        <div className="skeleton h-6 w-2/3 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-20 w-full rounded" />
        <div className="skeleton h-32 w-full rounded" />
        <div className="skeleton h-16 w-full rounded" />
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
        <AlertCircle size={24} className="text-danger" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white">Generation Failed</p>
        <p className="mt-1 text-xs text-muted max-w-sm leading-relaxed">
          {error}
        </p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 rounded-btn bg-accent px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-accent-light hover:shadow-glow-sm active:scale-[0.97]"
      >
        <RefreshCw size={12} />
        Try Again
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Artifact Renderer (type-based)
// ─────────────────────────────────────────────────────────────────────────────

function ArtifactRenderer({ artifact }) {
  switch (artifact.type) {
    case "quotation":
      return <QuotationPreview data={artifact} />;
    default:
      return (
        <div className="text-sm text-muted">
          <p>Unknown artifact type: {artifact.type}</p>
          <pre className="mt-2 text-xs bg-white/5 p-3 rounded-btn overflow-auto">
            {JSON.stringify(artifact, null, 2)}
          </pre>
        </div>
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Quotation Preview
// ─────────────────────────────────────────────────────────────────────────────

function QuotationPreview({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Title & Ref */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">{data.title}</h3>
          <p className="mt-0.5 text-xs text-muted">
            {data.metadata?.quotationRef} · {data.metadata?.quotationDate}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-2.5 py-1 shrink-0">
          <FileText size={11} className="text-accent" />
          <span className="text-[10px] font-semibold text-accent">QUOTATION</span>
        </div>
      </div>

      {/* Recipient */}
      <div className="rounded-btn bg-white/[0.02] border border-border p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1.5">To</p>
        <p className="text-sm font-medium text-white">{data.recipient?.company}</p>
        {data.recipient?.contact && (
          <p className="text-xs text-slate-400 mt-0.5">{data.recipient.contact}</p>
        )}
        {data.recipient?.address && (
          <p className="text-xs text-slate-500 mt-0.5">{data.recipient.address}</p>
        )}
      </div>

      {/* Subject */}
      {data.subject && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">Subject</p>
          <p className="text-sm text-slate-200">{data.subject}</p>
        </div>
      )}

      {/* Introduction */}
      {data.introduction && (
        <p className="text-[13px] leading-relaxed text-slate-300">
          {data.introduction}
        </p>
      )}

      {/* Line Items Table */}
      {data.lineItems?.length > 0 && (
        <div className="rounded-btn border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/[0.03] border-b border-border">
                <th className="px-3 py-2 text-left font-semibold text-muted w-8">#</th>
                <th className="px-3 py-2 text-left font-semibold text-muted">Description</th>
                <th className="px-3 py-2 text-right font-semibold text-muted w-12">Qty</th>
                <th className="px-3 py-2 text-right font-semibold text-muted w-24">Unit Price</th>
                <th className="px-3 py-2 text-right font-semibold text-muted w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2 text-slate-500">{item.sno}</td>
                  <td className="px-3 py-2 text-slate-200">{item.description}</td>
                  <td className="px-3 py-2 text-right text-slate-300">
                    {item.qty} {item.unit}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-300">
                    ₹{item.unitPrice?.toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-white">
                    ₹{item.total?.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* GST Breakup */}
      {data.gstBreakup && (
        <div className="rounded-btn bg-white/[0.02] border border-border p-3 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">
            GST Breakup
          </p>
          <GstRow label="Subtotal" value={data.gstBreakup.subtotal} />
          <GstRow
            label={`CGST @ ${data.gstBreakup.cgstRate}%`}
            value={data.gstBreakup.cgstAmount}
          />
          <GstRow
            label={`SGST @ ${data.gstBreakup.sgstRate}%`}
            value={data.gstBreakup.sgstAmount}
          />
          <div className="border-t border-border pt-1.5 mt-1.5">
            <GstRow
              label="Total (incl. GST)"
              value={data.gstBreakup.totalWithGst}
              bold
            />
          </div>
        </div>
      )}

      {/* Delivery Timeline */}
      {data.deliveryTimeline && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">
            Delivery Timeline
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">{data.deliveryTimeline}</p>
        </div>
      )}

      {/* Terms & Conditions */}
      {data.terms?.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1.5">
            Terms & Conditions
          </p>
          <ol className="list-decimal list-inside space-y-1">
            {data.terms.map((term, i) => (
              <li key={i} className="text-xs text-slate-400 leading-relaxed">
                {term}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Closing */}
      {data.closing && (
        <p className="text-[13px] leading-relaxed text-slate-300 italic">
          {data.closing}
        </p>
      )}

      {/* Validity */}
      {data.metadata?.validUntil && (
        <p className="text-[11px] text-muted">
          This quotation is valid until {data.metadata.validUntil}.
        </p>
      )}
    </motion.div>
  );
}

function GstRow({ label, value, bold = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${bold ? "font-semibold text-slate-200" : "text-slate-400"}`}>
        {label}
      </span>
      <span className={`text-xs ${bold ? "font-bold text-white" : "text-slate-300"}`}>
        ₹{value?.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Plain text converter (for Copy / Download)
// ─────────────────────────────────────────────────────────────────────────────

function artifactToPlainText(artifact) {
  if (artifact.type === "quotation") {
    return quotationToText(artifact);
  }
  return JSON.stringify(artifact, null, 2);
}

function quotationToText(data) {
  const lines = [];

  lines.push(data.title);
  lines.push("=".repeat(data.title.length));
  lines.push("");

  if (data.metadata?.quotationRef) {
    lines.push(`Ref: ${data.metadata.quotationRef}`);
    lines.push(`Date: ${data.metadata.quotationDate}`);
    lines.push("");
  }

  lines.push("TO:");
  lines.push(`  ${data.recipient?.company || ""}`);
  if (data.recipient?.contact) lines.push(`  ${data.recipient.contact}`);
  if (data.recipient?.address) lines.push(`  ${data.recipient.address}`);
  lines.push("");

  if (data.subject) {
    lines.push(`Subject: ${data.subject}`);
    lines.push("");
  }

  if (data.introduction) {
    lines.push(data.introduction);
    lines.push("");
  }

  if (data.lineItems?.length > 0) {
    lines.push("LINE ITEMS:");
    lines.push("-".repeat(70));
    lines.push(
      padRight("#", 4) +
      padRight("Description", 30) +
      padRight("Qty", 8) +
      padRight("Unit Price", 14) +
      padRight("Total", 14)
    );
    lines.push("-".repeat(70));

    for (const item of data.lineItems) {
      lines.push(
        padRight(String(item.sno), 4) +
        padRight(item.description, 30) +
        padRight(`${item.qty} ${item.unit}`, 8) +
        padRight(`₹${item.unitPrice?.toLocaleString("en-IN")}`, 14) +
        padRight(`₹${item.total?.toLocaleString("en-IN")}`, 14)
      );
    }
    lines.push("-".repeat(70));
    lines.push("");
  }

  if (data.gstBreakup) {
    lines.push("GST BREAKUP:");
    lines.push(`  Subtotal:             ₹${data.gstBreakup.subtotal?.toLocaleString("en-IN")}`);
    lines.push(`  CGST @ ${data.gstBreakup.cgstRate}%:          ₹${data.gstBreakup.cgstAmount?.toLocaleString("en-IN")}`);
    lines.push(`  SGST @ ${data.gstBreakup.sgstRate}%:          ₹${data.gstBreakup.sgstAmount?.toLocaleString("en-IN")}`);
    lines.push(`  TOTAL (incl. GST):    ₹${data.gstBreakup.totalWithGst?.toLocaleString("en-IN")}`);
    lines.push("");
  }

  if (data.deliveryTimeline) {
    lines.push(`DELIVERY: ${data.deliveryTimeline}`);
    lines.push("");
  }

  if (data.terms?.length > 0) {
    lines.push("TERMS & CONDITIONS:");
    data.terms.forEach((t, i) => lines.push(`  ${i + 1}. ${t}`));
    lines.push("");
  }

  if (data.closing) {
    lines.push(data.closing);
    lines.push("");
  }

  if (data.metadata?.validUntil) {
    lines.push(`Valid until: ${data.metadata.validUntil}`);
  }

  return lines.join("\n");
}

function padRight(str, len) {
  return (str || "").slice(0, len).padEnd(len);
}
