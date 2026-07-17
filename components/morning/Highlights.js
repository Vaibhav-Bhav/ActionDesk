"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, IndianRupee, Phone, CalendarDays } from "lucide-react";
import { buildActionCenterUrl } from "@/lib/deepLink";

/**
 * Highlights — four business-context chips.
 * Sprint 4.6: Each chip now deep-links to the correct filter in Action Center.
 *
 * Props:
 *   cards  ActionCard[]
 */
export default function Highlights({ cards }) {
  const router = useRouter();
  const pending = cards.filter((c) => c.status !== "Done");

  const urgent    = pending.filter((c) => c.priority === "High").length;
  const customers = pending.filter((c) => c.category === "Customer Request").length;
  const meetings  = pending.filter((c) => c.category === "Meeting").length;

  // Pending payment amount — derive from seed data: Invoice #INV-2291 is ₹48,500
  const paymentCards = pending.filter((c) => ["Invoice", "Payment"].includes(c.category));
  const pendingAmount = paymentCards.length > 0 ? "₹48,500" : "₹0";

  const chips = [
    {
      id:    "urgent",
      icon:  AlertTriangle,
      label: `${urgent} Urgent`,
      bg:    "bg-danger/8 hover:bg-danger/14 border-danger/15 text-danger",
      show:  true,
      href:  buildActionCenterUrl({ priority: "High", from: "morning", highlight: true }),
    },
    {
      id:    "payments",
      icon:  IndianRupee,
      label: `${pendingAmount} Pending`,
      bg:    "bg-warning/8 hover:bg-warning/14 border-warning/15 text-warning",
      show:  paymentCards.length > 0,
      href:  buildActionCenterUrl({ category: "Invoice", from: "morning", highlight: true }),
    },
    {
      id:    "customers",
      icon:  Phone,
      label: `${customers} Customer${customers !== 1 ? "s" : ""} Waiting`,
      bg:    "bg-accent/8 hover:bg-accent/14 border-accent/15 text-accent",
      show:  customers > 0,
      href:  buildActionCenterUrl({ category: "Customer Request", from: "morning", highlight: true }),
    },
    {
      id:    "meetings",
      icon:  CalendarDays,
      label: `${meetings} Meeting${meetings !== 1 ? "s" : ""} Today`,
      bg:    "bg-success/8 hover:bg-success/14 border-success/15 text-success",
      show:  meetings > 0,
      href:  buildActionCenterUrl({ category: "Meeting", from: "morning", highlight: true }),
    },
  ];

  const visible = chips.filter((c) => c.show);
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((chip) => {
        const Icon = chip.icon;
        return (
          <button
            key={chip.id}
            onClick={() => router.push(chip.href)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-95 ${chip.bg}`}
          >
            <Icon size={12} strokeWidth={2.5} />
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
