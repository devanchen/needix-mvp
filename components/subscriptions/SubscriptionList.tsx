// components/subscriptions/SubscriptionList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { showToast } from "@/lib/toast";

type SubscriptionDTO = {
  id: string;
  userId: string;
  service: string;
  plan: string | null;
  manageUrl: string | null;
  price: number | null;
  nextDate: string | null;   // ISO
  intervalDays: number | null;
  canceled: boolean;
  createdAt: string;
  updatedAt: string;
};

type Draft = {
  service: string;
  plan: string;
  manageUrl: string;
  price: string;     // input string
  nextDate: string;  // YYYY-MM-DD
  intervalDays: string; // input string
};

export default function SubscriptionList({ initialSubs }: { initialSubs: SubscriptionDTO[] }) {
  const r = useRouter();
  const [rows, setRows] = useState<SubscriptionDTO[]>(initialSubs);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const dateRef = useRef<HTMLInputElement | null>(null);

  function startEdit(s: SubscriptionDTO) {
    setEditing(s.id);
    setDraft({
      service: s.service,
      plan: s.plan ?? "",
      manageUrl: s.manageUrl ?? "",
      price: s.price == null ? "" : String(s.price),
      nextDate: s.nextDate ? s.nextDate.slice(0, 10) : "",
      intervalDays: s.intervalDays == null ? "" : String(s.intervalDays),
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
      intervalDays: draft.intervalDays.trim() === "" ? null : Number(draft.intervalDays),
    };

    // optimistic
    const prev = rows;
    setRows((list) =>
      list.map((s) =>
        s.id === id
          ? {
              ...s,
              service: body.service,
              plan: body.plan,
              manageUrl: body.manageUrl,
              price: body.price as any,
              nextDate: body.nextDate,
              intervalDays: body.intervalDays as any,
            }
          : s
      )
    );

    const res = await fetch(`/api/subscriptions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      showToast("Subscription updated");
      const updated = await res.json();
      setRows((list) => list.map((s) => (s.id === id ? updated : s)));
      setEditing(null);
      setDraft(null);
      r.refresh();
    } else {
      showToast("Failed to update");
      setRows(prev);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this subscription?")) return;
    const prev = rows;
    setRows((list) => list.filter((s) => s.id !== id));

    const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Subscription deleted");
      r.refresh();
    } else {
      showToast("Failed to delete");
      setRows(prev);
    }
  }

  async function toggleCancel(id: string) {
    const prev = rows;
    setRows((list) =>
      list.map((s) => (s.id === id ? { ...s, canceled: !s.canceled } : s))
    );

    const res = await fetch(`/api/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-cancel" }),
    });

    if (res.ok) {
      const updated = await res.json();
      setRows((list) => list.map((s) => (s.id === id ? updated : s)));
      showToast(updated.canceled ? "Marked as canceled" : "Restored");
      r.refresh();
    } else {
      setRows(prev);
      showToast("Failed to update status");
    }
  }

  async function advance(id: string) {
    const prev = rows;
    // optimistic: +1 month display only
    setRows((list) =>
      list.map((s) => {
        if (s.id !== id) return s;
        const base = s.nextDate ? new Date(s.nextDate) : new Date();
        const tmp = new Date(base);
        tmp.setMonth(tmp.getMonth() + 1);
        return { ...s, nextDate: tmp.toISOString() };
      })
    );

    const res = await fetch(`/api/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "advance" }),
    });

    if (res.ok) {
      const updated = await res.json();
      setRows((list) => list.map((s) => (s.id === id ? updated : s)));
      showToast("Next date advanced");
      r.refresh();
    } else {
      setRows(prev);
      showToast("Failed to advance");
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
            <th className="px-4 py-3 font-medium">Every (days)</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((s) => {
            const isEditing = editing === s.id;
            const rowClass = s.canceled ? "opacity-50" : "";
            return (
              <tr key={s.id} className={`bg-white/[0.02] hover:bg-white/[0.04] ${rowClass}`}>
                {/* Service */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      value={draft?.service ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...(d as Draft), service: e.target.value }))}
                      className="w-full rounded-lg border border-white/15 bg-transparent px-2 py-1.5 text-sm outline-none"
                    />
                  ) : (
                    <span className={`font-medium ${s.canceled ? "line-through" : ""}`}>{s.service}</span>
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
                      {s.price == null ? "—" : `$${Number(s.price).toFixed(2)}`}
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

                {/* intervalDays */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      type="number"
                      inputMode="numeric"
                      value={draft?.intervalDays ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...(d as Draft), intervalDays: e.target.value }))}
                      className="w-full rounded-lg border border-white/15 bg-transparent px-2 py-1.5 text-sm outline-none"
                    />
                  ) : (
                    <span className="opacity-90">{s.intervalDays ?? "—"}</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span className={`rounded-md px-2 py-1 text-xs ${s.canceled ? "bg-red-500/15 text-red-200" : "bg-emerald-500/15 text-emerald-200"}`}>
                    {s.canceled ? "Canceled" : "Active"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => cancelEdit()}
                        className="rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => save(s.id)}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:opacity-90"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => advance(s.id)}
                        className="rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                        title="Mark as renewed (advance next date)"
                      >
                        Renewed
                      </button>
                      <button
                        onClick={() => toggleCancel(s.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium ${s.canceled ? "bg-white text-gray-900" : "border border-white/20 hover:bg-white/10"}`}
                      >
                        {s.canceled ? "Restore" : "Cancel"}
                      </button>
                      <button
                        onClick={() => startEdit(s)}
                        className="rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => del(s.id)}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:opacity-90"
                      >
                        Delete
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
