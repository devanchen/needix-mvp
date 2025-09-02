// components/subscriptions/CreateSubscription.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "./DatePicker";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void; // called after successful create
};

type Draft = {
  service: string;
  plan: string | null;
  priceInput: string;       // <-- keep as string while typing (allows ".")
  nextDate: string | null;  // ISO (we default to today @ noon UTC)
  manageUrl: string | null;
  canceled: boolean;
};

type Preset = { label: string; plan?: string; manageUrl?: string; price?: number };

const PRESETS: Preset[] = [
  { label: "Netflix", plan: "Standard", manageUrl: "https://www.netflix.com/account", price: 15.49 },
  { label: "Spotify", plan: "Premium", manageUrl: "https://www.spotify.com/account", price: 10.99 },
  { label: "Amazon Prime", manageUrl: "https://www.amazon.com/yourmemberships", price: 14.99 },
  { label: "YouTube Premium", manageUrl: "https://www.youtube.com/paid_memberships", price: 13.99 },
  { label: "Disney+", manageUrl: "https://www.disneyplus.com/account", price: 7.99 },
  { label: "Apple Music", manageUrl: "https://music.apple.com/account/subscriptions", price: 10.99 },
  { label: "Adobe Creative Cloud", manageUrl: "https://account.adobe.com/plans", price: 54.99 },
  { label: "Microsoft 365", manageUrl: "https://account.microsoft.com/services", price: 9.99 },
  { label: "iCloud", manageUrl: "https://appleid.apple.com/account", price: 0.99 },
  { label: "Dropbox", manageUrl: "https://www.dropbox.com/account/plan", price: 11.99 },
  { label: "NYTimes", manageUrl: "https://myaccount.nytimes.com/subscription", price: 9.99 },
  { label: "Crunchyroll", manageUrl: "https://www.crunchyroll.com/account/membership", price: 7.99 },
  { label: "PlayStation Plus", manageUrl: "https://www.playstation.com/account/subscriptions/", price: 9.99 },
  { label: "Xbox Game Pass", manageUrl: "https://account.microsoft.com/services", price: 10.99 },
  { label: "Costco", plan: "Annual", manageUrl: "https://www.costco.com/renew.html", price: 60.0 },
];

// helpers
const priceRegex = /^\d+(\.\d{1,2})?$/;
function isValidPriceString(v: string): boolean {
  if (!priceRegex.test(v)) return false;
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}
function isValidUrl(v: string): boolean {
  try {
    // URL constructor validates protocol + structure
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

export default function CreateSubscription({ open, onClose, onCreated }: Props) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>("");

  // today @ 12:00 UTC (avoids off-by-one across time zones)
  const todayIsoNoonUTC = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const noon = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0));
    return noon.toISOString();
  }, []);

  const [draft, setDraft] = useState<Draft>({
    service: "",
    plan: null,
    priceInput: "",
    nextDate: todayIsoNoonUTC,
    manageUrl: "",
    canceled: false,
  });

  useEffect(() => {
    if (open) {
      setErr("");
      setDraft({
        service: "",
        plan: null,
        priceInput: "",
        nextDate: todayIsoNoonUTC,
        manageUrl: "",
        canceled: false,
      });
    }
  }, [open, todayIsoNoonUTC]);

  function applyPreset(p: Preset) {
    setDraft((d) => ({
      ...d,
      service: p.label,
      plan: p.plan ?? d.plan,
      priceInput: p.price != null ? String(p.price) : d.priceInput,
      manageUrl: p.manageUrl ?? d.manageUrl,
    }));
  }

  const priceOk = isValidPriceString(draft.priceInput);
  const serviceOk = draft.service.trim().length > 0;
  const dateOk = Boolean(draft.nextDate);
  const urlOk = Boolean(draft.manageUrl && isValidUrl(draft.manageUrl));
  const formOk = serviceOk && priceOk && dateOk && urlOk;

  async function create() {
    if (!formOk) return;

    setSaving(true);
    setErr("");
    try {
      const priceNumber = Number(draft.priceInput);
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: draft.service.trim(),
          plan: draft.plan,
          price: priceNumber,
          nextDate: draft.nextDate,
          manageUrl: draft.manageUrl,
          canceled: false,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string })?.error ?? "Create failed");
      }
      onCreated();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-white/15 bg-[#0b0f1a] p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">🆕 New subscription</div>
          <button onClick={onClose} className="rounded-md border border-white/15 px-2 py-1 text-sm hover:bg-white/[0.07]">
            Close
          </button>
        </div>

        {/* Presets */}
        <div className="mt-4">
          <div className="text-xs text-white/70">Popular services</div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm hover:bg-white/[0.07]"
              >
                {p.label}
                {p.plan ? <div className="text-[11px] text-white/60">{p.plan}</div> : null}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form
          className="mt-5 grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void create();
          }}
        >
          <div className="md:col-span-2">
            <label className="text-xs text-white/70">Service *</label>
            <input
              className="mt-1 w-full rounded-md border bg-transparent px-3 py-2"
              placeholder="e.g. Netflix"
              value={draft.service}
              onChange={(e) => setDraft({ ...draft, service: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs text-white/70">Plan (optional)</label>
            <input
              className="mt-1 w-full rounded-md border bg-transparent px-3 py-2"
              placeholder="e.g. Premium"
              value={draft.plan ?? ""}
              onChange={(e) => setDraft({ ...draft, plan: e.target.value || null })}
            />
          </div>

          <div>
            <label className="text-xs text-white/70">Price *</label>
            <div className="relative mt-1">
              <input
                className={[
                  "w-full rounded-md border bg-transparent px-3 py-2 pr-8",
                  priceOk || draft.priceInput.length === 0 ? "" : "border-rose-400/60",
                ].join(" ")}
                inputMode="decimal"
                autoComplete="off"
                placeholder="e.g. 11.99"
                value={draft.priceInput}
                onChange={(e) => setDraft({ ...draft, priceInput: e.target.value })}
              />
              <span className="pointer-events-none absolute inset-y-0 right-2 inline-flex items-center text-sm text-white/70">
                $
              </span>
            </div>
            {!priceOk && draft.priceInput.length > 0 && (
              <div className="mt-1 text-[11px] text-rose-300">Use a valid price (e.g. 11.99)</div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-white/70">Next renewal date *</label>
            <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-start">
              <DatePicker
                value={draft.nextDate}
                onChange={(iso) => setDraft({ ...draft, nextDate: iso })}
                minDate={new Date()}
              />
              <div className="text-sm text-white/70 md:mt-2 md:pl-2">
                Selected:{" "}
                <span className="text-white">
                  {draft.nextDate ? new Date(draft.nextDate).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-white/70">Manage / cancel URL *</label>
            <input
              className={[
                "mt-1 w-full rounded-md border bg-transparent px-3 py-2",
                urlOk || !draft.manageUrl ? "" : "border-rose-400/60",
              ].join(" ")}
              placeholder="https://example.com/account"
              value={draft.manageUrl ?? ""}
              onChange={(e) => setDraft({ ...draft, manageUrl: e.target.value })}
            />
            {draft.manageUrl && !urlOk && (
              <div className="mt-1 text-[11px] text-rose-300">Enter a full URL (including https://)</div>
            )}
          </div>

          <div className="md:col-span-2 mt-1 flex gap-2">
            <button
              type="submit"
              disabled={saving || !formOk}
              className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm hover:bg-emerald-400/15 disabled:opacity-60"
            >
              {saving ? "Creating…" : "Create subscription"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/15 px-4 py-2 text-sm hover:bg-white/[0.07]"
            >
              Cancel
            </button>
          </div>

          {err && <div className="md:col-span-2 text-sm text-amber-300">{err}</div>}
        </form>
      </div>
    </div>
  );
}
