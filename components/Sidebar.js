"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Upload,
  BrainCircuit,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/action-center", label: "Action Center", icon: Inbox },
  { href: "/imports", label: "Imports", icon: Upload },
  { href: "/business-memory", label: "Business Memory", icon: BrainCircuit },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-accent/20 text-accent">
          <Zap size={18} strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-white">
          ActionDesk
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-btn px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <p className="text-xs font-medium text-slate-300">Furniture Business</p>
        <p className="text-xs text-muted">Hackathon MVP</p>
      </div>
    </aside>
  );
}
