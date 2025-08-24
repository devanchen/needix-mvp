// components/subscriptions/SubscriptionList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { showToast } from "@/lib/toast";

/** Keep this in sync with the DTO exported by the page */
type SubscriptionDTO = {
  id: string;
  userId: string;
  service: string;
  plan: string | null;
  manageUrl: string | null;
  price: number | null;      // number from server
  nextDate: string | null;   // ISO string or null
  createdAt: string;
  updatedAt: string;
  __optimistic?: true;       // local marker (temp row)
};

type Draft = {
  service: string;
  plan: string;
  manageUrl: string;
  price: string;     // input uses string
  nextDate: string;  // YYYY-MM-DD
};

function Spinner({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-80"
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SubscriptionList({ initialSubs }: { initialSubs: SubscriptionDTO[] }) {
  const r = useRouter();

  // local copy for optimistic updates
  const [rows, setRows] = useState<SubscriptionDTO[]>(initialSubs);

  // transient UI states
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [highlightIds, setHighlightIds] = useState<string[]>([]); // flash after success

  const dateRef = useRef<HTMLInputElement | null>(null);

  // keep in sync after router.refresh()
  useEffect(() => {
    setRows(initialSubs);
  }, [initialSubs]);

  // helper: flash highlight for a couple seconds
  function flash(id: string, ms = 2200) {
    setHighlightIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    setTimeout(() => {
      setHighlightIds((ids) => ids.filter((x) => x !== id));
    }, ms);
  }

  // listen for optimistic create events from the form
  useEffect(() => {
    function onCreated(e: Event) {
      const ev = e as CustomEvent<SubscriptionDTO>;
      const row = ev.detail;
      if (!row) return;
      setRows((rws) => [row, ...rws]);
    }
    function onReplace(e: Event) {
      const ev = e as CustomEvent<{ tempId: string; row: SubscriptionDTO }>;
      const { tempId, row } = ev.detail || ({} as any);
      if (!row) return;
      setRows((rws) => {
        const idx = rws.findIndex((x) => x.id === tempId);
        if (idx !== -1) {
          const copy = rws.slice();
          copy[idx] = row; // swap temp → real
          return copy;
        }
        // if temp already gone (refresh), ensure we insert/merge once
        if (!rws.some((x) => x.id === row.id)) return [row, ...rws];
        return rws.map((x) => (x.id === row.id ? row : x));
      });
      flash(row.id);
    }
    function onRevert(e: Event) {
      const ev = e as CustomEvent<{ tempId: string }>;
      const { tempId } = ev.detail || ({} as any);
      if (!tempId) return;
      setRows((rws) => rws.filter((x) => x.id !== tempId));
    }

    window.addEventListener("sub:created", onCreated as EventListener);
    window.addEventListener("sub:replace", onReplace as EventListener);
    window.addEventListener("sub:revert", onRevert as EventListener);
    return () => {
      window.removeEventListener("sub:created", onCreated as EventListener);
      window.removeEventListener("sub:replace", onReplace as EventListener);
      window.removeEventListener("sub:revert", onRevert as EventListener);
    };
  }, []);

  async function del(id: string) {
    if (!confirm("Delete this subscription?")) return;

    const prev = rows;
    setDeletingId(id);
    // optimistic remove
    setRows((rws) => rws.filter((x) => x.id !== id));

    const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });

    setDeletingId(null);
    if (res.ok) {
      showToast("Subscription deleted");
      r.refresh(); // background sync
    } else {
      // revert
      setRows(prev);
      alert("Failed to delete");
    }
  }

  function startEdit(s: SubscriptionDTO) {
    setEditing(s.id);
    setDraft({
      service: s.service,
      plan: s.plan ?? "",
      manageUrl: s.manageUrl ?? "",
      price: s.price == null ? "" : String(s.price),
      nextDate: s.nextDate ? new Date(s.nextDate).toISOString().slice(0, 10) : "",
    });
  }

  function cancelEdit() {
    setEditing(null);
    setDraft(null);
  }

  async function save(id: string) {
    if (!draft) return;

    const body = {
      service: draft.service.trim(),
      plan: draft.plan.trim() || null,
      manageUrl: draft.manageUrl.trim() || null,
      price: draft.price.trim() === "" ? null : Number(draft.price),
      nextDate: draft.nextDate || null,
    };

    // optimistic update
    const prev = rows;
    const optimistic: Partial<SubscriptionDTO> = {
      service: body.service,
      plan: body.plan,
      manageUrl: body.manageUrl,
      price: body.price,
      nextDate: body.nextDate ? new Date(body.nextDate).toISOString() : null,
    };
    setRows((rws) => rws.map((x) => (x.id === id ? ({ ...x, ...optimistic } as SubscriptionDTO) : x)));
    setSavingId(id);
    setEditing(null);
    setDraft(null);

    const res = await fetch(`/api/subscriptions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSavingId(null);
    if (res.ok) {
      const updated: SubscriptionDTO = await res.json();
      setRows((rws) => rws.map((x) => (x.id === id ? updated : x)));
      showToast("Subscription updated");
      flash(id);
      r.refresh(); // background sync
    } else {
      setRows(prev); // revert
      alert("Failed to update");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-left text-white/70">
          <tr>
            <th className="px-4 py-3 font-medium">Service</th>
            <th className="px-4 py-3 font-medium">Plan</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Next date</th>
            <th className="px-4 py-3 font-medium">Manage URL</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((s) => {
            const isEditing = editing === s.id;
            const displayPriceNum = s.price;
            const isSaving = savingId === s.id;
            const isDeleting = deletingId === s.id;
            const highlighted = highlightIds.includes(s.id);

            const rowBase =
              "bg-white/[0.02] hover:bg-white/[0.04] transition-colors";
            const rowOptimistic =
              "animate-pulse bg-white/[0.04] ring-1 ring-white/10";
            const rowHighlight =
              "ring-1 ring-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]";

            return (
              <tr
                key={s.id}
                className={`${rowBase} ${s.__optimistic ? rowOptimistic : ""} ${
                  highlighted ? rowHighlight : ""
                }`}
              >
                {/* Service */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      value={draft?.service ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...(d as Draft), service: e.target.value }))}
                      className="w-full rounded-lg border border-white/15 bg-transparent px-2 py-1.5 text-sm outline-none"
                    />
                  ) : (
                    <span className="font-medium">{s.service}</span>
                  )}
                </td>

                {/* Plan */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      value={draft?.plan ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...(d as Draft), plan: e.target.value }))}
                      className="w-full rounded-lg border border-white/15 bg-transparent px-2 py-1.5 text-sm outline-none"
                    />
                  ) : (
                    <span className="opacity-75">{s.plan || "—"}</span>
                  )}
                </td>

                {/* Price */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={draft?.price ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...(d as Draft), price: e.target.value }))}
                      className="w-full rounded-lg border border-white/15 bg-transparent px-2 py-1.5 text-sm outline-none"
                    />
                  ) : (
                    <span className="opacity-90">
                      {displayPriceNum == null ? "—" : `$${displayPriceNum.toFixed(2)}`}
                    </span>
                  )}
                </td>

                {/* Next date */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <div className="relative">
                      <input
                        ref={dateRef}
                        type="date"
                        value={draft?.nextDate ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...(d as Draft), nextDate: e.target.value }))}
                        className="w-full rounded-lg border border-white/15 bg-transparent px-2 py-1.5 pr-8 text-sm outline-none"
                      />
                      <button
                        type="button"
                        aria-label="Open date picker"
                        onClick={() => dateRef.current?.showPicker?.()}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-white/10 focus-visible:outline-none"
                        tabIndex={-1}
                      >
                        <Calendar className="h-4 w-4 text-white opacity-90" />
                      </button>
                    </div>
                  ) : (
                    <span className="opacity-90">
                      {s.nextDate ? new Date(s.nextDate).toLocaleDateString() : "—"}
                    </span>
                  )}
                </td>

                {/* Manage URL */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="url"
                      value={draft?.manageUrl ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...(d as Draft), manageUrl: e.target.value }))}
                      className="w-full rounded-lg border border-white/15 bg-transparent px-2 py-1.5 text-sm outline-none"
                    />
                  ) : s.manageUrl ? (
                    <a
                      href={s.manageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white underline underline-offset-2 opacity-90 hover:opacity-100"
                    >
                      Open
                    </a>
                  ) : (
                    "—"
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  {s.__optimistic ? (
                    <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80">
                      <Spinner />
                      Saving…
                    </span>
                  ) : isEditing ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => cancelEdit()}
                        disabled={isSaving || isDeleting}
                        className="rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => save(s.id)}
                        disabled={isSaving || isDeleting}
                        className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:opacity-90 disabled:opacity-60"
                      >
                        {isSaving ? (
                          <>
                            <Spinner className="h-3.5 w-3.5 text-gray-900" />
                            Saving…
                          </>
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(s)}
                        disabled={isSaving || isDeleting}
                        className="rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => del(s.id)}
                        disabled={isSaving || isDeleting}
                        className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:opacity-90 disabled:opacity-60"
                      >
                        {isDeleting ? (
                          <>
                            <Spinner className="h-3.5 w-3.5 text-gray-900" />
                            Deleting…
                          </>
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
