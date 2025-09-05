"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import BrandIcon, { isBrand } from "@/components/icons/BrandIcon";

export type SubscriptionItem = {
  id: string;
  service: string;
  plan: string | null;
  price: number | null;
  nextDate: string | null; // ISO (may include time)
  manageUrl: string | null;
  canceled: boolean;
};

type Props = {
  initialSubscriptions: SubscriptionItem[];
  selectedId?: string;
  defaultOpenCreate?: boolean;
};

// ---------- helpers ----------
function clsx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}
function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function toDateOnlyString(isoLike: string): string | null {
  if (!isoLike) return null;
  const m = isoLike.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(isoLike);
  return Number.isNaN(d.getTime()) ? null : toISODate(d);
}
function fromISODateStrict(dateOnly: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);
  if (!m) return new Date(NaN);
  const y = +m[1], mo = +m[2], d = +m[3];
  const dt = new Date(y, mo - 1, d);
  return Number.isNaN(dt.getTime()) ? new Date(NaN) : dt;
}
function isBeforeDay(a: Date, b: Date) {
  return new Date(a.getFullYear(), a.getMonth(), a.getDate()) <
    new Date(b.getFullYear(), b.getMonth(), b.getDate());
}
const TODAY = new Date();

type Preset =
  | { name: "Netflix"; price?: number; url?: string }
  | { name: "Spotify"; price?: number; url?: string }
  | { name: "Amazon Prime"; price?: number; url?: string }
  | { name: "Xbox Game Pass"; price?: number; url?: string }
  | { name: "YouTube Premium"; price?: number; url?: string }
  | { name: "Disney+"; price?: number; url?: string }
  | { name: "Crunchyroll"; price?: number; url?: string };

const PRESETS: Preset[] = [
  { name: "Netflix", price: 15.49, url: "https://www.netflix.com/account" },
  { name: "Spotify", price: 10.99, url: "https://www.spotify.com/account/overview/" },
  { name: "Amazon Prime", price: 14.99, url: "https://www.amazon.com/mc" },
  { name: "Xbox Game Pass", price: 10.99, url: "https://account.microsoft.com/services/" },
  { name: "YouTube Premium", price: 13.99, url: "https://youtube.com/paid_memberships" },
  { name: "Disney+", price: 13.99, url: "https://www.disneyplus.com/account" },
  { name: "Crunchyroll", price: 7.99, url: "https://www.crunchyroll.com/ability/subscribe" },
];

type Suggestion = {
  tempId: string;
  service: string;
  plan: string | null;
  price: number | null;
  nextDate: string | null;   // YYYY-MM-DD
  manageUrl: string | null;
};

// Normalize messy names → consistent brand names
const NAME_ALIASES: Array<[RegExp, string]> = [
  [/^netflix/i, "Netflix"],
  [/spotify/i, "Spotify"],
  [/amazon\s*(prime|video)?/i, "Amazon Prime"],
  [/xbox.*(game\s*pass|ultimate)/i, "Xbox Game Pass"],
  [/youtube.*premium/i, "YouTube Premium"],
  [/disney/i, "Disney+"],
  [/crunchyroll/i, "Crunchyroll"],
];

function normalizeServiceName(raw: string) {
  const trimmed = (raw || "").trim();
  for (const [re, name] of NAME_ALIASES) {
    if (re.test(trimmed)) return name;
  }
  // Fallback: Title Case
  return trimmed
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

// ---------- Calendar ----------
function Calendar({
  value, onChange, minDate,
}: { value: string; onChange: (iso: string) => void; minDate: Date }) {
  const [view, setView] = useState(() => {
    const tryDate = value ? fromISODateStrict(value) : TODAY;
    const base = Number.isNaN(tryDate.getTime()) ? TODAY : tryDate;
    return { y: base.getFullYear(), m: base.getMonth() };
  });

  useEffect(() => {
    if (!value) return;
    const d = fromISODateStrict(value);
    const base = Number.isNaN(d.getTime()) ? TODAY : d;
    setView({ y: base.getFullYear(), m: base.getMonth() });
  }, [value]);

  const firstOfMonth = useMemo(() => new Date(view.y, view.m, 1), [view]);
  const daysInMonth = useMemo(() => new Date(view.y, view.m + 1, 0).getDate(), [view]);
  const startWeekday = firstOfMonth.getDay();
  const monthName = new Intl.DateTimeFormat(undefined, { month: "long" }).format(firstOfMonth);

  const grid: Array<{ day?: number; disabled?: boolean; iso?: string; isToday?: boolean; isSelected?: boolean }> = [];
  for (let i = 0; i < startWeekday; i++) grid.push({});
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(view.y, view.m, d);
    const iso = toISODate(date);
    const disabled = isBeforeDay(date, minDate);
    const isToday =
      date.getFullYear() === TODAY.getFullYear() &&
      date.getMonth() === TODAY.getMonth() &&
      date.getDate() === TODAY.getDate();
    const isSelected = value === iso;
    grid.push({ day: d, disabled, iso, isToday, isSelected });
  }

  function shiftMonth(delta: number) {
    const n = new Date(view.y, view.m + delta, 1);
    setView({ y: n.getFullYear(), m: n.getMonth() });
  }

  const prevDisabled =
    new Date(view.y, view.m + 1, 0) < new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={prevDisabled}
          onClick={() => shiftMonth(-1)}
          className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15 disabled:opacity-40"
        >
          ‹
        </button>
        <div className="text-sm font-semibold tracking-wide">{monthName} {view.y}</div>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
        >
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-white/70">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {grid.map((cell, i) =>
          cell.day ? (
            <button
              key={i}
              type="button"
              disabled={cell.disabled}
              onClick={() => cell.iso && onChange(cell.iso)}
              className={clsx(
                "h-9 rounded-md text-sm",
                cell.disabled && "opacity-30 cursor-not-allowed border border-white/5",
                !cell.disabled && "hover:bg-white/10",
                cell.isSelected ? "bg-white/20 border border-white/30" : "border border-white/10",
                cell.isToday && !cell.isSelected ? "ring-1 ring-white/30" : ""
              )}
              title={cell.iso}
            >
              {cell.day}
            </button>
          ) : (
            <div key={i} />
          )
        )}
      </div>
    </div>
  );
}

// ---------- Main ----------
export default function SubscriptionsClient({
  initialSubscriptions,
  selectedId,
  defaultOpenCreate,
}: Props) {
  const [subs, setSubs] = useState<SubscriptionItem[]>(initialSubscriptions);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState<boolean>(Boolean(defaultOpenCreate));

  // Gmail suggestions modal
  const [gmailOpen, setGmailOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");

  // form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [service, setService] = useState("");
  const [plan, setPlan] = useState("");
  const [priceStr, setPriceStr] = useState("");
  const [manageUrl, setManageUrl] = useState("");
  const [dateISO, setDateISO] = useState<string>(() => toISODate(TODAY));

  useEffect(() => {
    if (defaultOpenCreate) setOpen(true);
  }, [defaultOpenCreate]);

  function openForCreate(preset?: Preset) {
    setEditingId(null);
    setService(preset?.name ?? "");
    setPlan("");
    setPriceStr(preset?.price != null ? String(preset.price) : "");
    setManageUrl(preset?.url ?? "");
    setDateISO(toISODate(TODAY));
    setOpen(true);
  }

  function openForEdit(s: SubscriptionItem) {
    setEditingId(s.id);
    setService(s.service);
    setPlan(s.plan ?? "");
    setPriceStr(s.price != null ? String(s.price) : "");
    setManageUrl(s.manageUrl ?? "");
    const only = s.nextDate ? toDateOnlyString(s.nextDate) : null;
    setDateISO(only ?? toISODate(TODAY));
    setOpen(true);
  }

  function sanitizePriceInput(input: string) {
    const cleaned = input.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length <= 1) return cleaned;
    return parts[0] + "." + parts.slice(1).join("");
  }

  async function submitCreateOrUpdate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const priceNum = parseFloat(priceStr);
    if (!service.trim()) return alert("Please enter a service name.");
    if (!Number.isFinite(priceNum)) return alert("Please enter a valid price (e.g., 12.99).");
    if (!dateISO) return alert("Please pick a renewal date.");

    const fd = new FormData();
    fd.set("service", service.trim());
    fd.set("plan", plan.trim());
    fd.set("price", String(priceNum));
    fd.set("nextDate", dateISO);
    fd.set("manageUrl", manageUrl.trim());

    if (editingId) {
      const res = await fetch(`/api/subscriptions/${editingId}`, { method: "PATCH", body: fd });
      if (!res.ok) {
        const t = await res.text().catch(() => "Could not save changes");
        alert(t);
        return;
      }
      const updated: SubscriptionItem = await res.json();
      startTransition(() =>
        setSubs((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      );
    } else {
      const res = await fetch("/api/subscriptions", { method: "POST", body: fd });
      if (!res.ok) {
        const t = await res.text().catch(() => "Could not create subscription");
        alert(t);
        return;
      }
      const created: SubscriptionItem = await res.json();
      startTransition(() => setSubs((prev) => [created, ...prev]));
    }

    setOpen(false);
    setEditingId(null);
  }

  async function handleImportGmail() {
    const res = await fetch("/api/subscriptions/import/gmail");
    if (res.status === 409) {
      const url =
        "/api/auth/signin?" +
        new URLSearchParams({
          provider: "google",
          prompt: "consent",
          access_type: "offline",
          include_granted_scopes: "true",
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          callbackUrl: "/subscriptions?new=1",
        }).toString();
      window.location.assign(url);
      return;
    }
    if (!res.ok) {
      const txt = await res.text().catch(() => "Import failed");
      alert(txt);
      return;
    }

    const imported: SubscriptionItem[] = await res.json();
    if (imported.length === 0) {
      alert("No recent subscription emails found.");
      return;
    }

    const sgs: Suggestion[] = imported.map((r, i) => {
      const name = normalizeServiceName(r.service || "");
      return {
        tempId: r.id || `gmail-${Date.now()}-${i}`,
        service: name,
        plan: r.plan ?? null,
        price: r.price ?? null,
        nextDate: r.nextDate ? toDateOnlyString(r.nextDate) : null,
        manageUrl: r.manageUrl ?? null,
      };
    }).sort((a, b) => a.service.localeCompare(b.service));

    const initialSelect: Record<string, boolean> = {};
    sgs.forEach((s) => (initialSelect[s.tempId] = true));
    setSuggestions(sgs);
    setSelected(initialSelect);
    setQuery("");
    setGmailOpen(true);
  }

  async function addSelectedSuggestions() {
    const chosen = suggestions.filter((s) => selected[s.tempId]);
    if (chosen.length === 0) {
      setGmailOpen(false);
      return;
    }
    setAdding(true);
    const created: SubscriptionItem[] = [];

    for (const s of chosen) {
      const fd = new FormData();
      fd.set("service", s.service);
      if (s.plan) fd.set("plan", s.plan);
      if (s.price != null) fd.set("price", String(s.price));
      if (s.nextDate) fd.set("nextDate", s.nextDate);
      if (s.manageUrl) fd.set("manageUrl", s.manageUrl);
      const resp = await fetch("/api/subscriptions", { method: "POST", body: fd });
      if (resp.ok) {
        const item: SubscriptionItem = await resp.json();
        created.push(item);
      }
    }

    startTransition(() => setSubs((prev) => [...created, ...prev]));
    setAdding(false);
    setGmailOpen(false);
  }

  async function handleDelete(s: SubscriptionItem) {
    if (!confirm("Delete this subscription?")) return;

    const resp = await fetch(`/api/subscriptions/${s.id}`, { method: "DELETE" });
    if (!resp.ok && resp.status !== 404) {
      // Don’t block UI removal, but log what happened
      console.warn(
        "Delete failed",
        resp.status,
        await resp.text().catch(() => "")
      );
    }

    setSubs((prev) => prev.filter((x) => x.id !== s.id));
  }


  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suggestions;
    return suggestions.filter((s) =>
      [s.service, s.plan ?? "", s.manageUrl ?? ""].some((t) =>
        t.toLowerCase().includes(q)
      )
    );
  }, [suggestions, query]);

  // ---------- UI ----------
  return (
    <div className="space-y-6">
      {/* Top CTAs */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => openForCreate()}
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15"
        >
          + Add subscription
        </button>
        <button
          onClick={handleImportGmail}
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15"
        >
          Import from Gmail
        </button>
      </div>

      {/* Create/Edit modal */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="w-[min(720px,100%)] rounded-2xl border border-white/10 bg-neutral-900/95 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="text-sm font-semibold">
                  {editingId ? "Edit subscription" : "New subscription"}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-5 px-5 py-4 sm:grid-cols-2">
                {/* Left: form */}
                <form onSubmit={submitCreateOrUpdate} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">🧾 Service</label>
                    <input
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      placeholder="e.g., Paper towels"
                      className="w-full rounded-xl border border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">📦 Plan</label>
                    <input
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      placeholder="e.g., Standard / 2-pack"
                      className="w-full rounded-xl border border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">💵 Price (USD)</label>
                    <input
                      inputMode="decimal"
                      value={priceStr}
                      onChange={(e) => setPriceStr(sanitizePriceInput(e.target.value))}
                      placeholder="12.99"
                      className="w-full rounded-xl border border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                    />
                    <p className="mt-1 text-xs text-white/60">
                      Only digits and one dot are accepted; other characters are ignored.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">🔗 Manage URL (optional)</label>
                    <input
                      type="url"
                      value={manageUrl}
                      onChange={(e) => setManageUrl(e.target.value)}
                      placeholder="https://provider.example.com/account"
                      className="w-full rounded-xl border border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full rounded-xl bg-black px-4 py-2 text-white hover:bg-black/90 disabled:opacity-60"
                  >
                    {isPending ? "Saving…" : editingId ? "Save changes" : "Add subscription"}
                  </button>
                </form>

                {/* Right: presets + calendar */}
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-xs font-semibold text-white/70">✨ Quick picks</div>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => openForCreate(p)}
                          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-left text-sm hover:bg-white/15"
                          title={`Fill ${p.name}`}
                        >
                          <BrandIcon name={p.name} className="w-5 h-5" />
                          <span className="font-medium">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">📅 Next renewal</label>
                    <Calendar
                      value={dateISO}
                      onChange={(iso) => setDateISO(iso)}
                      minDate={new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate())}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Gmail Suggestions modal — clean table */}
      {gmailOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setGmailOpen(false)} aria-hidden />
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="w-[min(900px,100%)] rounded-2xl border border-white/10 bg-neutral-900/95 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="text-sm font-semibold">Import from Gmail — review & select</div>
                <button
                  onClick={() => setGmailOpen(false)}
                  className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
                >
                  Close
                </button>
              </div>

              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search services…"
                    className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/20 bg-transparent"
                      checked={filteredSuggestions.length > 0 && filteredSuggestions.every((s) => selected[s.tempId])}
                      onChange={(e) => {
                        const all = e.target.checked;
                        setSelected((prev) => {
                          const next = { ...prev };
                          filteredSuggestions.forEach((s) => (next[s.tempId] = all));
                          return next;
                        });
                      }}
                    />
                    Select all
                  </label>
                </div>

                <div className="max-h-[55vh] overflow-auto rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-neutral-900/95">
                      <tr className="text-left text-white/70">
                        <th className="w-10 px-3 py-2"></th>
                        <th className="px-3 py-2">Service</th>
                        <th className="px-3 py-2">Plan</th>
                        <th className="px-3 py-2">Price</th>
                        <th className="px-3 py-2">Next charge</th>
                        <th className="px-3 py-2">Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSuggestions.map((s) => {
                        const brand = isBrand(s.service) ? s.service : null;
                        return (
                          <tr key={s.tempId} className="border-t border-white/10 hover:bg-white/[0.03]">
                            <td className="px-3 py-2 align-middle">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-white/20 bg-transparent"
                                checked={!!selected[s.tempId]}
                                onChange={(e) =>
                                  setSelected((prev) => ({ ...prev, [s.tempId]: e.target.checked }))
                                }
                              />
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <div className="flex items-center gap-2">
                                {brand && <BrandIcon name={brand} className="h-4 w-4" />}
                                <span className="font-medium text-white">{s.service}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 align-middle text-white/80">{s.plan ?? "—"}</td>
                            <td className="px-3 py-2 align-middle text-white/80">
                              {s.price != null ? `$${s.price.toFixed(2)}` : "—"}
                            </td>
                            <td className="px-3 py-2 align-middle text-white/80">{s.nextDate ?? "—"}</td>
                            <td className="px-3 py-2 align-middle">
                              {s.manageUrl ? (
                                <a
                                  href={s.manageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-white/70 underline"
                                >
                                  Open
                                </a>
                              ) : (
                                <span className="text-white/40">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setGmailOpen(false)}
                    className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addSelectedSuggestions}
                    disabled={adding}
                    className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-black/90 disabled:opacity-60"
                  >
                    {adding ? "Adding…" : "Add selected"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* List */}
      <div className="space-y-3">
        {subs.length === 0 ? (
          <p className="text-sm text-white/70">No subscriptions yet.</p>
        ) : (
          subs.map((s) => {
            const isSelected = selectedId === s.id;
            const brand = isBrand(s.service) ? s.service : null;

            return (
              <div
                key={s.id}
                className={clsx(
                  "rounded-xl border border-white/10 bg-white/[0.04] p-4",
                  isSelected && "ring-2 ring-white/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-base font-medium text-white">
                      {brand && <BrandIcon name={brand} className="w-4 h-4" />}
                      {s.service}
                      {s.canceled && (
                        <span className="ml-2 rounded bg-rose-500/20 px-2 py-0.5 text-xs text-rose-200">
                          Canceled
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-white/70">
                      {s.plan ?? "—"} •{" "}
                      {typeof s.price === "number" ? `$${s.price.toFixed(2)}` : "—"} •{" "}
                      {s.nextDate ? new Date(s.nextDate).toLocaleDateString() : "—"}
                    </div>
                    {s.manageUrl && (
                      <a
                        href={s.manageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs text-white/70 underline"
                      >
                        Manage on provider →
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openForEdit(s)}
                      className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs text-rose-200 hover:bg-white/15"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
