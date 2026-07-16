"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Copy, Download, RefreshCw, Check, Sparkles,
  FileText, AlertCircle, Mail, MessageSquare, Package,
  ShieldCheck,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Modal Shell
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AiPreviewModal — reusable modal for previewing AI-generated artifacts.
 *
 * States: loading → preview → error
 * Renderers: quotation | email | whatsapp | stockNote
 * Actions: Copy, Download, Regenerate, Mark Done
 *
 * Sprint 4.4: Added email/whatsapp/stockNote renderers, AI transparency
 * block, quotation formatting fixes, fade-in animation.
 */
export default function AiPreviewModal({ open, onClose, card, actionType, onMarkDone }) {
  const [artifact, setArtifact] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [copied, setCopied]     = useState(false);

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
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setArtifact(data.artifact);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [card?.id, actionType]);

  useEffect(() => {
    if (open && actionType) generate();
    if (!open) { setArtifact(null); setError(null); setCopied(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, actionType]);

  function handleCopy() {
    if (!artifact) return;
    navigator.clipboard.writeText(artifactToPlainText(artifact)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    if (!artifact) return;
    const text = artifactToPlainText(artifact);
    const blob = new Blob([text], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${artifact.metadata?.quotationRef || artifact.metadata?.ref || "document"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleRegenerate() { setArtifact(null); setCopied(false); generate(); }
  function handleMarkDone()   { onMarkDone?.(); onClose(); }
  function handleClose()      { setArtifact(null); setError(null); setCopied(false); onClose(); }

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
              {loading && <LoadingState actionType={actionType} />}
              {error && <ErrorState error={error} onRetry={handleRegenerate} />}
              {artifact && !loading && !error && (
                <>
                  <ArtifactRenderer artifact={artifact} />
                  <AiTransparencyBlock card={card} />
                </>
              )}
            </div>

            {/* ── Footer Actions ──────────────────────────────── */}
            {artifact && !loading && !error && (
              <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-3.5 shrink-0">
                <div className="flex items-center gap-2">
                  <ActionButton icon={copied ? Check : Copy} label={copied ? "Copied!" : "Copy"} onClick={handleCopy} accent={copied} />
                  <ActionButton icon={Download}  label="Download"   onClick={handleDownload} />
                  <ActionButton icon={RefreshCw} label="Regenerate" onClick={handleRegenerate} />
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
// Shared Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ActionButton({ icon: Icon, label, onClick, accent = false }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-btn border px-3 py-1.5 text-xs font-medium transition-all hover:bg-white/5 active:scale-[0.97] ${
        accent ? "border-success/30 text-success" : "border-border text-slate-300 hover:text-white"
      }`}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1.5">
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading / Error
// ─────────────────────────────────────────────────────────────────────────────

function LoadingState({ actionType }) {
  const typeLabels = {
    "Draft Formal Quotation":    "Drafting quotation…",
    "Create Payment Reminder":   "Writing reminder email…",
    "Draft Apology & Resolution":"Drafting resolution reply…",
    "Draft WhatsApp Follow-up":  "Composing message…",
    "Confirm Stock Availability":"Checking stock availability…",
    "Draft Negotiation Reply":   "Drafting negotiation reply…",
  };
  const label = typeLabels[actionType] || "Generating document…";

  return (
    <div className="space-y-5 py-8">
      <div className="flex flex-col items-center gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
          <Sparkles size={20} className="text-accent" />
        </motion.div>
        <p className="text-sm font-medium text-slate-300 animate-pulse">{label}</p>
        <p className="text-xs text-muted">This usually takes 5–10 seconds</p>
      </div>
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
        <p className="mt-1 text-xs text-muted max-w-sm leading-relaxed">{error}</p>
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
// Artifact Renderer — type switch
// ─────────────────────────────────────────────────────────────────────────────

function ArtifactRenderer({ artifact }) {
  switch (artifact.type) {
    case "quotation":  return <QuotationPreview data={artifact} />;
    case "email":      return <EmailPreview data={artifact} />;
    case "whatsapp":   return <WhatsAppPreview data={artifact} />;
    case "stockNote":  return <StockNotePreview data={artifact} />;
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

// shared fade-in wrapper for all previews
function PreviewFade({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quotation Preview
// ─────────────────────────────────────────────────────────────────────────────

function QuotationPreview({ data }) {
  return (
    <PreviewFade>
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
        <SectionLabel>To</SectionLabel>
        <p className="text-sm font-medium text-white">{data.recipient?.company}</p>
        {data.recipient?.contact && <p className="text-xs text-slate-400 mt-0.5">{data.recipient.contact}</p>}
        {data.recipient?.address && <p className="text-xs text-slate-500 mt-0.5">{data.recipient.address}</p>}
      </div>

      {data.subject && (
        <div>
          <SectionLabel>Subject</SectionLabel>
          <p className="text-sm text-slate-200">{data.subject}</p>
        </div>
      )}

      {data.introduction && (
        <p className="text-[13px] leading-relaxed text-slate-300">{data.introduction}</p>
      )}

      {/* Line Items Table */}
      {data.lineItems?.length > 0 && (
        <div className="rounded-btn border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/[0.03] border-b border-border">
                <th className="px-3 py-2 text-left font-semibold text-muted w-8">#</th>
                <th className="px-3 py-2 text-left font-semibold text-muted">Description</th>
                <th className="px-3 py-2 text-right font-semibold text-muted w-16">Qty</th>
                <th className="px-3 py-2 text-right font-semibold text-muted w-24">Unit Price</th>
                <th className="px-3 py-2 text-right font-semibold text-muted w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2 text-slate-500">{item.sno}</td>
                  <td className="px-3 py-2 text-slate-200 break-words">{item.description}</td>
                  <td className="px-3 py-2 text-right text-slate-300 whitespace-nowrap">{item.qty} {item.unit}</td>
                  <td className="px-3 py-2 text-right text-slate-300 whitespace-nowrap">₹{item.unitPrice?.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-2 text-right font-medium text-white whitespace-nowrap">₹{item.total?.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* GST Breakup */}
      {data.gstBreakup && (
        <div className="rounded-btn bg-white/[0.02] border border-border p-3 space-y-1.5">
          <SectionLabel>GST Breakup</SectionLabel>
          <GstRow label="Subtotal" value={data.gstBreakup.subtotal} />
          <GstRow label={`CGST @ ${data.gstBreakup.cgstRate}%`} value={data.gstBreakup.cgstAmount} />
          <GstRow label={`SGST @ ${data.gstBreakup.sgstRate}%`} value={data.gstBreakup.sgstAmount} />
          <div className="border-t border-border pt-1.5 mt-1.5">
            <GstRow label="Total (incl. GST)" value={data.gstBreakup.totalWithGst} bold />
          </div>
        </div>
      )}

      {data.deliveryTimeline && (
        <div>
          <SectionLabel>Delivery Timeline</SectionLabel>
          <p className="text-xs text-slate-300 leading-relaxed">{data.deliveryTimeline}</p>
        </div>
      )}

      {data.terms?.length > 0 && (
        <div>
          <SectionLabel>Terms & Conditions</SectionLabel>
          <ol className="list-decimal list-inside space-y-1">
            {data.terms.map((term, i) => (
              <li key={i} className="text-xs text-slate-400 leading-relaxed">{term}</li>
            ))}
          </ol>
        </div>
      )}

      {data.closing && (
        <p className="text-[13px] leading-relaxed text-slate-300 italic">{data.closing}</p>
      )}

      {data.metadata?.validUntil && (
        <p className="text-[11px] text-muted">
          This quotation is valid until {data.metadata.validUntil}.
        </p>
      )}
    </PreviewFade>
  );
}

function GstRow({ label, value, bold = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${bold ? "font-semibold text-slate-200" : "text-slate-400"}`}>{label}</span>
      <span className={`text-xs ${bold ? "font-bold text-white" : "text-slate-300"}`}>
        ₹{value?.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Email Preview (Payment Reminder, Complaint Reply, Negotiation Reply)
// ─────────────────────────────────────────────────────────────────────────────

const EMAIL_LABEL_CONFIG = {
  "Payment Reminder":    { icon: Mail,   color: "text-warning",  bg: "bg-warning/10",  border: "border-warning/20",  badge: "REMINDER"   },
  "Complaint Resolution":{ icon: Mail,   color: "text-danger",   bg: "bg-danger/10",   border: "border-danger/20",   badge: "RESOLUTION" },
  "Negotiation Reply":   { icon: Mail,   color: "text-accent",   bg: "bg-accent/10",   border: "border-accent/20",   badge: "NEGOTIATION"},
};

function EmailPreview({ data }) {
  const cfg = EMAIL_LABEL_CONFIG[data.actionLabel] || EMAIL_LABEL_CONFIG["Payment Reminder"];
  const Icon = cfg.icon;

  const urgencyColors = {
    High:   "text-danger bg-danger/10 border-danger/20",
    Medium: "text-warning bg-warning/10 border-warning/20",
    Low:    "text-success bg-success/10 border-success/20",
  };
  const urgencyStyle = urgencyColors[data.metadata?.urgencyLevel] || urgencyColors.Medium;

  return (
    <PreviewFade>
      {/* Email header bar */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-btn ${cfg.bg}`}>
            <Icon size={14} className={cfg.color} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full border px-2 py-0.5 ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                {cfg.badge}
              </span>
              {data.metadata?.urgencyLevel && (
                <span className={`text-[10px] font-semibold uppercase tracking-wider rounded-full border px-2 py-0.5 ${urgencyStyle}`}>
                  {data.metadata.urgencyLevel} priority
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted mt-0.5">{data.metadata?.emailDate}</p>
          </div>
        </div>
        {data.metadata?.ref && (
          <span className="text-[10px] text-muted font-mono shrink-0">{data.metadata.ref}</span>
        )}
      </div>

      {/* Subject */}
      <div className="rounded-btn bg-white/[0.02] border border-border p-3">
        <SectionLabel>Subject</SectionLabel>
        <p className="text-sm font-medium text-white">{data.subject}</p>
      </div>

      {/* Email body */}
      <div className="rounded-btn border border-border overflow-hidden">
        {/* Email chrome */}
        <div className="border-b border-border bg-white/[0.02] px-4 py-2.5">
          <p className="text-[11px] text-muted">
            <span className="text-slate-500">To:</span>{" "}
            <span className="text-slate-300">{data.greeting?.replace(/^Dear\s+/, "").replace(/,$/, "")}</span>
          </p>
        </div>

        <div className="px-4 py-4 space-y-3">
          {/* Greeting */}
          <p className="text-sm text-slate-200">{data.greeting}</p>

          {/* Body paragraphs */}
          {data.body?.map((para, i) => (
            <p key={i} className="text-[13px] leading-relaxed text-slate-300">{para}</p>
          ))}

          {/* Closing + Signature */}
          <div className="pt-2 border-t border-border/50 mt-2">
            <p className="text-sm text-slate-300">{data.closing}</p>
            <p className="text-sm font-medium text-slate-200 mt-1">{data.signature}</p>
          </div>
        </div>
      </div>

      {data.metadata?.resolutionDeadline && (
        <div className="rounded-btn bg-warning/5 border border-warning/20 px-3 py-2">
          <p className="text-xs text-warning">
            <span className="font-semibold">Resolution committed by:</span>{" "}
            {data.metadata.resolutionDeadline}
          </p>
        </div>
      )}
    </PreviewFade>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp Preview
// ─────────────────────────────────────────────────────────────────────────────

function WhatsAppPreview({ data }) {
  const lines = data.message?.split("\n") || [];
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <PreviewFade>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-btn bg-green-500/10">
            <MessageSquare size={14} className="text-green-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider rounded-full border px-2 py-0.5 text-green-400 bg-green-500/10 border-green-500/20">
              WHATSAPP
            </span>
            <p className="text-[11px] text-muted mt-0.5">{data.metadata?.sentDate}</p>
          </div>
        </div>
        <span className="text-[10px] text-muted">
          {data.characterCount} chars · {data.tone}
        </span>
      </div>

      {/* WhatsApp phone chrome */}
      <div className="rounded-card overflow-hidden border border-green-500/20 bg-[#0b1014]">
        {/* Status bar */}
        <div className="flex items-center gap-2 bg-[#1f2c34] px-3 py-2 border-b border-white/5">
          <div className="h-7 w-7 rounded-full bg-green-500/20 flex items-center justify-center">
            <MessageSquare size={12} className="text-green-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-white leading-none">Business Contact</p>
            <p className="text-[10px] text-green-400 mt-0.5">online</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="p-4 min-h-[120px]" style={{ background: "linear-gradient(135deg, #0d1b21 0%, #0b1014 100%)" }}>
          {/* Message bubble */}
          <div className="flex justify-end">
            <div className="max-w-[85%] bg-[#005c4b] rounded-[12px_12px_2px_12px] px-3.5 py-2.5 shadow-sm">
              {lines.map((line, i) => (
                line.trim() === "" ? (
                  <div key={i} className="h-2" />
                ) : (
                  <p key={i} className="text-[13px] leading-relaxed text-white">{line}</p>
                )
              ))}
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] text-white/50">{timeStr}</span>
                <svg width="14" height="10" viewBox="0 0 18 11" className="text-accent">
                  <path d="M17.394.614 6.745 11.263 1.22 5.739l.884-.884 4.64 4.64L16.51-.27l.884.884Z" fill="currentColor" fillOpacity=".85"/>
                  <path d="M11.394.614.745 11.263l.884.884 10-10-.235-.533Z" fill="currentColor" fillOpacity=".4"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted">
        Ready to copy and send via WhatsApp.
      </p>
    </PreviewFade>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stock Note Preview
// ─────────────────────────────────────────────────────────────────────────────

const STOCK_STATUS_CONFIG = {
  Available:   { color: "text-success", bg: "bg-success/10", border: "border-success/20", dot: "bg-success" },
  Partial:     { color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", dot: "bg-warning" },
  Unavailable: { color: "text-danger",  bg: "bg-danger/10",  border: "border-danger/20",  dot: "bg-danger"  },
};

function StockNotePreview({ data }) {
  const cfg = STOCK_STATUS_CONFIG[data.availability] || STOCK_STATUS_CONFIG.Available;

  return (
    <PreviewFade>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-btn bg-orange-500/10">
            <Package size={14} className="text-orange-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider rounded-full border px-2 py-0.5 text-orange-400 bg-orange-500/10 border-orange-500/20">
              STOCK NOTE
            </span>
            <p className="text-[11px] text-muted mt-0.5">{data.metadata?.confirmedDate}</p>
          </div>
        </div>
        {data.metadata?.ref && (
          <span className="text-[10px] text-muted font-mono">{data.metadata.ref}</span>
        )}
      </div>

      {/* Availability badge */}
      <div className={`rounded-card border p-4 ${cfg.bg} ${cfg.border}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          <span className={`text-sm font-bold ${cfg.color}`}>{data.availability}</span>
        </div>
        <p className="text-base font-semibold text-white leading-snug">{data.headline}</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">{data.message}</p>
      </div>

      {/* Items table */}
      {data.items?.length > 0 && (
        <div className="rounded-btn border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/[0.03] border-b border-border">
                <th className="px-3 py-2 text-left font-semibold text-muted">Item</th>
                <th className="px-3 py-2 text-right font-semibold text-muted w-20">Qty</th>
                <th className="px-3 py-2 text-right font-semibold text-muted w-28">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => {
                const itemCfg = STOCK_STATUS_CONFIG[item.status === "In Stock" ? "Available" : item.status] || STOCK_STATUS_CONFIG.Available;
                return (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="px-3 py-2 text-slate-200">{item.name}</td>
                    <td className="px-3 py-2 text-right text-slate-300">{item.qty}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`text-[10px] font-semibold rounded-full border px-2 py-0.5 ${itemCfg.color} ${itemCfg.bg} ${itemCfg.border}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Dispatch + Next Step */}
      <div className="space-y-2">
        {data.dispatch && (
          <div className="flex gap-2 rounded-btn bg-white/[0.02] border border-border px-3 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted shrink-0 mt-0.5">Dispatch</span>
            <p className="text-xs text-slate-300 leading-relaxed">{data.dispatch}</p>
          </div>
        )}
        {data.nextStep && (
          <div className="flex gap-2 rounded-btn bg-accent/5 border border-accent/20 px-3 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent shrink-0 mt-0.5">Next</span>
            <p className="text-xs text-slate-300 leading-relaxed">{data.nextStep}</p>
          </div>
        )}
      </div>
    </PreviewFade>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Transparency Block (Part 3)
// ─────────────────────────────────────────────────────────────────────────────

const TRANSPARENCY_SOURCES = [
  "Current Action Card",
  "Business Memory",
  "Customer History",
  "Previous Communication",
  "AI Reasoning",
];

function AiTransparencyBlock({ card }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="mt-8 pt-5 border-t border-border/50"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <ShieldCheck size={11} className="text-muted" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          Generated using
        </p>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {TRANSPARENCY_SOURCES.map((source) => (
          <div key={source} className="flex items-center gap-1.5">
            <Check size={10} className="text-success/70 shrink-0" />
            <span className="text-[11px] text-slate-500">{source}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Plain text converters (Copy / Download)
// ─────────────────────────────────────────────────────────────────────────────

function artifactToPlainText(artifact) {
  switch (artifact.type) {
    case "quotation": return quotationToText(artifact);
    case "email":     return emailToText(artifact);
    case "whatsapp":  return artifact.message || "";
    case "stockNote": return stockNoteToText(artifact);
    default:          return JSON.stringify(artifact, null, 2);
  }
}

// ── Quotation ────────────────────────────────────────────────────────────────

function quotationToText(data) {
  const COL_DESC = 40; // wider — no truncation
  const COL_QTY  = 10;
  const COL_PRICE = 16;
  const COL_TOTAL = 16;
  const lines = [];

  lines.push(data.title);
  lines.push("=".repeat(data.title.length));
  lines.push("");

  if (data.metadata?.quotationRef) {
    lines.push(`Ref:  ${data.metadata.quotationRef}`);
    lines.push(`Date: ${data.metadata.quotationDate}`);
    lines.push("");
  }

  lines.push("TO:");
  lines.push(`  ${data.recipient?.company || ""}`);
  if (data.recipient?.contact) lines.push(`  ${data.recipient.contact}`);
  if (data.recipient?.address) lines.push(`  ${data.recipient.address}`);
  lines.push("");

  if (data.subject) { lines.push(`Subject: ${data.subject}`); lines.push(""); }
  if (data.introduction) { lines.push(data.introduction); lines.push(""); }

  if (data.lineItems?.length > 0) {
    lines.push("LINE ITEMS:");
    const sep = "-".repeat(COL_DESC + COL_QTY + COL_PRICE + COL_TOTAL + 4);
    lines.push(sep);
    lines.push(
      padRight("Description", COL_DESC) + " " +
      padRight("Qty",         COL_QTY)  + " " +
      padLeft("Unit Price",   COL_PRICE) + " " +
      padLeft("Total",        COL_TOTAL)
    );
    lines.push(sep);
    for (const item of data.lineItems) {
      // wrap long descriptions
      const descWords = item.description.split(" ");
      const descLines = [];
      let cur = "";
      for (const w of descWords) {
        if ((cur + " " + w).trim().length <= COL_DESC) {
          cur = (cur + " " + w).trim();
        } else {
          if (cur) descLines.push(cur);
          cur = w;
        }
      }
      if (cur) descLines.push(cur);

      descLines.forEach((dl, di) => {
        if (di === 0) {
          lines.push(
            padRight(dl, COL_DESC) + " " +
            padRight(`${item.qty} ${item.unit}`, COL_QTY) + " " +
            padLeft(`₹${item.unitPrice?.toLocaleString("en-IN")}`, COL_PRICE) + " " +
            padLeft(`₹${item.total?.toLocaleString("en-IN")}`,     COL_TOTAL)
          );
        } else {
          lines.push(padRight(dl, COL_DESC));
        }
      });
    }
    lines.push(sep);
    lines.push("");
  }

  if (data.gstBreakup) {
    lines.push("GST BREAKUP:");
    lines.push(`  Subtotal:              ₹${data.gstBreakup.subtotal?.toLocaleString("en-IN")}`);
    lines.push(`  CGST @ ${data.gstBreakup.cgstRate}%:           ₹${data.gstBreakup.cgstAmount?.toLocaleString("en-IN")}`);
    lines.push(`  SGST @ ${data.gstBreakup.sgstRate}%:           ₹${data.gstBreakup.sgstAmount?.toLocaleString("en-IN")}`);
    lines.push(`  TOTAL (incl. GST):     ₹${data.gstBreakup.totalWithGst?.toLocaleString("en-IN")}`);
    lines.push("");
  }

  if (data.deliveryTimeline) { lines.push(`Delivery: ${data.deliveryTimeline}`); lines.push(""); }

  if (data.terms?.length > 0) {
    lines.push("TERMS & CONDITIONS:");
    data.terms.forEach((t, i) => lines.push(`  ${i + 1}. ${t}`));
    lines.push("");
  }

  if (data.closing)            { lines.push(data.closing); lines.push(""); }
  if (data.metadata?.validUntil) lines.push(`Valid until: ${data.metadata.validUntil}`);

  return lines.join("\n");
}

// ── Email ─────────────────────────────────────────────────────────────────────

function emailToText(data) {
  const lines = [];
  if (data.actionLabel) { lines.push(data.actionLabel.toUpperCase()); lines.push("=".repeat(data.actionLabel.length)); lines.push(""); }
  if (data.metadata?.emailDate) { lines.push(`Date: ${data.metadata.emailDate}`); lines.push(""); }
  lines.push(`Subject: ${data.subject}`);
  lines.push("");
  if (data.greeting) { lines.push(data.greeting); lines.push(""); }
  data.body?.forEach((p) => { lines.push(p); lines.push(""); });
  if (data.closing)   { lines.push(data.closing); }
  if (data.signature) lines.push(data.signature);
  if (data.metadata?.resolutionDeadline) { lines.push(""); lines.push(`Resolution committed by: ${data.metadata.resolutionDeadline}`); }
  return lines.join("\n");
}

// ── Stock Note ────────────────────────────────────────────────────────────────

function stockNoteToText(data) {
  const lines = [];
  lines.push("STOCK AVAILABILITY CONFIRMATION");
  lines.push("=".repeat(32));
  lines.push("");
  if (data.metadata?.ref)           lines.push(`Ref:    ${data.metadata.ref}`);
  if (data.metadata?.confirmedDate) lines.push(`Date:   ${data.metadata.confirmedDate}`);
  lines.push(`Status: ${data.availability}`);
  lines.push("");
  lines.push(data.headline);
  lines.push(data.message);
  lines.push("");
  if (data.items?.length > 0) {
    lines.push("Items:");
    data.items.forEach((item) => lines.push(`  • ${item.name} — ${item.qty} — ${item.status}`));
    lines.push("");
  }
  if (data.dispatch) { lines.push(`Dispatch: ${data.dispatch}`); lines.push(""); }
  if (data.nextStep) lines.push(`Next Step: ${data.nextStep}`);
  return lines.join("\n");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function padRight(str, len) {
  return (str || "").padEnd(len).slice(0, len);
}

function padLeft(str, len) {
  return (str || "").padStart(len).slice(-len);
}
