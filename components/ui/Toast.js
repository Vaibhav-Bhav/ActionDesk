"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

/* ── Context ──────────────────────────────────────────────── */
const ToastContext = createContext(null);

let _toastId = 0;

/**
 * ToastProvider — wrap the app (or layout) with this.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ message, type = "info", duration = 4000 }) => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * useToast — hook to trigger toasts from any client component.
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast({ message: "Saved!", type: "success" });
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return { toast: ctx.addToast };
}

/* ── Internal Stack ───────────────────────────────────────── */
function ToastStack({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

const TOAST_CONFIGS = {
  success: { icon: CheckCircle2, color: "text-success", border: "border-success/20", bg: "bg-success/5" },
  error:   { icon: AlertCircle,  color: "text-danger",  border: "border-danger/20",  bg: "bg-danger/5"  },
  info:    { icon: Info,         color: "text-accent",  border: "border-accent/20",  bg: "bg-accent/5"  },
};

function ToastItem({ toast, onDismiss }) {
  const config = TOAST_CONFIGS[toast.type] ?? TOAST_CONFIGS.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 32, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 32, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-start gap-3 rounded-card border ${config.border} ${config.bg} px-4 py-3 shadow-elevated backdrop-blur-sm min-w-[280px] max-w-sm`}
    >
      <Icon size={16} className={`mt-0.5 shrink-0 ${config.color}`} />
      <p className="flex-1 text-sm text-slate-200">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 text-muted transition-colors hover:text-slate-200"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
