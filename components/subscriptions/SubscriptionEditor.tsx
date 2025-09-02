// components/subscriptions/SubscriptionEditor.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DatePicker from "./DatePicker";

type Loaded = {
  id: string;
  service: string;
  plan: string | null;
  price: number | string | null; // API may return Decimal as string
  nextDate: string | null;        // ISO
  manageUrl: string | null;
  canceled: boolean;
};

type Draft = {
  service: string;
  plan: string | null;
  priceInput: string;       // <-- keep as string while typing
  nextDate: string | null;  // ISO
  manageUrl: string | null;
  canceled: boolean;
};

const priceRegex = /^\d+(\.\d{1,2})?$/;
function isValidPriceString(v: string): boolean {
  if (!priceRegex.test(v)) return false;
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}
function isValidUrl(v: string): boolean {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}
function toPriceInput(p: number | string | null): string {
  if (p === null || p === undefined) return "";
  if (typeof p === "string") return p;
  if (Number.isFinite(p)) return String(p);
  return "";
}

export default function SubscriptionEditor() {
  const router = useRouter();
  const sp = useSearchParams();
  const id = sp.get("id");

  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  // today @ noon UTC (for default when no date is set)
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
    if (!id) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    setErr("");

    (async () => {
      try {
        const res = await fetch(`/api/subscriptions/${id}`, { cache: "no-store" });
        if (!res.ok) {
          setErr("Couldn't load subscription.");
          return;
        }
        const s = (await res.json()) as Loaded;
        setDraft({
          service: s.service ?? "",
          plan: s.plan ?? null,
          priceInput: toPriceInput(s.price),
          nextDate: s.nextDate ?? todayIsoNoonUTC,
          manageUrl: s.manageUrl ?? "",
          canceled: Boolean(s.canceled),
        });
      } catch {
        setErr("Couldn't load subscription.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, todayIsoNoonUTC]);

  const priceOk = isValidPriceString(draft.priceInput);
  const serviceOk = draft.service.trim().length > 0;
  const dateOk = Boolean(draft.nextDate);
  const urlOk = Boolean(draft.manageUrl && isValidUrl(draft.manageUrl));
  const formOk = serviceOk && priceOk && dateOk && urlOk;

  async function save() {
    if (!id || !formOk) return;
    setLoading(true);
    setErr("");
    try {
      const priceNumber = Number(draft.priceInput);
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: draft.service.trim(),
          plan: draft.plan,
          price: priceNumber,
          nextDate: draft.nextDate,
          manageUrl: draft.manageUrl,
          canceled: draft.canceled,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string })?.error ?? "Save failed");
      }
      // close and refresh list
      close();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    // remove ?id= from URL without navigating away
    const url = new URL(window.location.href);
    url.searchParams.delete("id");
    router.replace(url.toString(), { scroll: false });
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-white/15 bg-[#0b0f1a] p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">✏️ Edit subscription</div>
          <button onClick={close} className="rounded-md border border-white/15 px-2 py-1 text-sm hover:bg-white/[0.07]">
            Close
          </button>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-white/70">Loading…</div>
        ) : (
          <form
            className="mt-5 grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <div className="md:col-span-2">
              <label className="text-xs text-white/70">Service *</label>
              <input
                className="mt-1 w-full rounded-md border bg-transparent px-3 py-2"
                value={draft.service}
                onChange={(e) => setDraft({ ...draft, service: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs text-white/70">Plan (optional)</label>
              <input
                className="mt-1 w-full rounded-md border bg-transparent px-3 py-2"
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
                  placeholder="e.g. 9.99"
                  // 👇 always a string; never NaN
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
                  draft.manageUrl && !isValidUrl(draft.manageUrl) ? "border-rose-400/60" : "",
                ].join(" ")}
                value={draft.manageUrl ?? ""}
                onChange={(e) => setDraft({ ...draft, manageUrl: e.target.value })}
                placeholder="https://example.com/account"
              />
              {draft.manageUrl && !isValidUrl(draft.manageUrl) && (
                <div className="mt-1 text-[11px] text-rose-300">Enter a full URL (including https://)</div>
              )}
            </div>

            <div className="md:col-span-2 mt-1 flex gap-2">
              <button
                type="submit"
                disabled={loading || !formOk}
                className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm hover:bg-emerald-400/15 disabled:opacity-60"
              >
                {loading ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-md border border-white/15 px-4 py-2 text-sm hover:bg-white/[0.07]"
              >
                Cancel
              </button>
            </div>

            {err && <div className="md:col-span-2 text-sm text-amber-300">{err}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
