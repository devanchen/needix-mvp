// components/marketing/HeroPreview.tsx
"use client";

import { CalendarDays, ExternalLink, BellRing, Plus, CheckCircle2 } from "lucide-react";

type Row = {
  name: string;
  plan?: string;
  price?: string;
  next: string;
  url?: string;
  color: string; // tailwind bg color for the avatar dot
  initial: string;
};

const rows: Row[] = [
  { name: "Netflix",  plan: "Standard", price: "$15.49", next: "Tomorrow",    url: "#", color: "bg-red-500",    initial: "N" },
  { name: "Spotify",  plan: "Premium",  price: "$10.99", next: "In 3 days",   url: "#", color: "bg-green-500",  initial: "S" },
  { name: "Costco",   plan: "Annual",   price: "$60.00", next: "Next week",   url: "#", color: "bg-yellow-400", initial: "C" },
  { name: "ChatGPT",  plan: "Plus",     price: "$20.00", next: "Today",       url: "#", color: "bg-purple-500", initial: "G" },
];

export default function HeroPreview() {
  const countThisWeek = rows.filter(r => ["Today","Tomorrow","In 3 days","Next week"].includes(r.next)).length;

  return (
    <div className="relative">
      {/* soft glow */}
      <div className="pointer-events-none absolute -inset-8 -z-10 bg-[radial-gradient(900px_420px_at_20%_-10%,rgba(239,68,68,0.15),transparent)]" />
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
        {/* Top: Upcoming widget */}
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-white/10 bg-black/50 p-2">
              <CalendarDays className="h-5 w-5 text-white/90" />
            </div>
            <div>
              <p className="text-sm text-white/70">Upcoming renewals</p>
              <p className="text-xl font-semibold">{countThisWeek} this week</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
            <BellRing className="h-4 w-4" />
            Email reminders on
          </div>
        </div>

        {/* List */}
        <div className="mt-4 space-y-2">
          {rows.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ${r.color}`}>
                  {r.initial}
                </div>
                <div>
                  <div className="text-sm font-medium">{r.name}{r.plan ? <span className="text-white/60"> — {r.plan}</span> : null}</div>
                  <div className="text-xs text-white/60">{r.price ?? ""}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/70">{r.next}</span>
                <a
                  href={r.url ?? "#"}
                  className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/90 hover:bg-white/10"
                >
                  Manage <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Add new */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-3">
          <div className="flex items-center gap-2 text-white/80">
            <Plus className="h-4 w-4" />
            <span className="text-sm">Add subscription</span>
          </div>
          <div className="inline-flex items-center gap-1 text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs">Takes ~60 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}
