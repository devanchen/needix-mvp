// components/subscriptions/SubscriptionList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { showToast } from "@/lib/toast";

/** Keep this in sync with the DTO exported by the page */
type SubscriptionDTO = {
  id: string;
  userId: string;
  service: string;
  plan: string | null;
  manageUrl: string | null;
  price: number | null;      // already a number from server
  nextDate: string | null;   // ISO string or null
  createdAt: string;
  updatedAt: string;
};

type Draft = {
  service: string;
  plan: string;
  manageUrl: string;
  price: string;     // input uses string
  nextDate: string;  // YYYY-MM-DD
};

export default function SubscriptionList({ initialSubs }: { initialSubs: SubscriptionDTO[] }) {
  const r = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const dateRef = useRef<HTMLInputElement | null>(null);

  async function del(id: string) {
    if (!confirm("Delete this subscription?")) return;
    const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Subscription deleted");
      r.refresh();
    } else {
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

    const res = await fetch(`/api/subscriptions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      showToast("Subscription updated");
      setEditing(null);
      setDraft(null);
      r.refresh();
    } else {
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
          {initialSubs.map((s) => {
            const isEditing = editing === s.id;
            const displayPriceNum = s.price;

            return (
              <tr key={s.id} className="bg-white/[0.02] hover:bg-white/[0.04]">
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
                    <div className="flex justify-end gap-2">
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
