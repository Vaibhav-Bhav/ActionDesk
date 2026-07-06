"use client";

import { AlertCircle, Clock3, Wallet, Truck } from "lucide-react";
import { useCards } from "@/lib/useCards";
import KpiCard from "@/components/KpiCard";
import TodaysFocus from "@/components/TodaysFocus";
import RecentActivity from "@/components/RecentActivity";
import SyncButtons from "@/components/SyncButtons";

export default function DashboardPage() {
  const { cards, loading, addCards } = useCards();

  const pending = cards.filter((c) => c.status !== "Done");
  const urgent = pending.filter((c) => c.priority === "High").length;
  const payments = pending.filter((c) => ["Invoice", "Payment"].includes(c.category)).length;
  const quotations = pending.filter((c) => c.category === "Quotation").length;
  const enquiries = pending.filter((c) => c.category === "Customer Request").length;
  const estMinutes = urgent * 8 + Math.max(0, pending.length - urgent) * 2;

  return (
    <div className="space-y-8">
      <section className="rounded-card border border-border bg-card p-8">
        <p className="text-2xl font-semibold text-white">Good morning, Raj 👋</p>
        <p className="mt-2 text-sm text-muted">
          I reviewed your business activity. Today's priority: {urgent} urgent{" "}
          {urgent === 1 ? "action" : "actions"}
          {estMinutes > 0 && <> · Estimated completion: ~{estMinutes} minutes</>}
        </p>
        <div className="mt-6">
          <SyncButtons onSynced={addCards} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={AlertCircle} label="Urgent Payments" value={urgent} tone="danger" />
        <KpiCard icon={Clock3} label="Supplier Quotations" value={quotations} tone="warning" />
        <KpiCard icon={Wallet} label="Pending Payments" value={payments} tone="accent" />
        <KpiCard icon={Truck} label="Customer Enquiries" value={enquiries} tone="success" />
      </section>

      <section className="rounded-card border border-border bg-card p-5">
        <p className="text-sm text-muted">
          Total Pending Actions: <span className="font-semibold text-white">{pending.length}</span>
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {!loading && <TodaysFocus cards={cards} />}
        {!loading && <RecentActivity cards={cards} />}
      </section>
    </div>
  );
}
