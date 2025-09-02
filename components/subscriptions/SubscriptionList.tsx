// components/subscriptions/SubscriptionList.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Sub = {
  id: string;
  service: string;
  plan?: string | null;
  manageUrl?: string | null;
  price?: number | null;
  nextDate?: string | null; // ISO
  canceled: boolean;
};

export default function SubscriptionList({ initial }: { initial: Sub[] }) {
  const [subs, setSubs] = useState<Sub[]>(initial);
  const [busyId, setBusyId] = useState<string | null>(null);

  // When props change (after router.refresh/replace), update local state
  useEffect(() => {
    setSubs(initial);
  }, [initial]);

  async function onDelete(id: string) {
    if (!confirm("Delete this subscription?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSubs((s) => s.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      alert("Could not delete. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (!subs.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white/80">
        You haven’t added any subscriptions yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="min-w-full text-sm">
        <thead className="bg-white/[0.04] text-white/70">
          <tr>
            <th className="px-4 py-2 text-left font-medium">Service</th>
            <th className="px-4 py-2 text-right font-medium">Price</th>
            <th className="px-4 py-2 text-right font-medium">Next date</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {subs.map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-2">
                <div className="font-medium">{s.service}{s.plan ? ` (${s.plan})` : ""}</div>
                {s.manageUrl && (
                  <a
                    href={s.manageUrl}
                    target="_blank"
                    className="text-xs text-white/60 underline"
                  >
                    Manage / Cancel
                  </a>
                )}
              </td>
              <td className="px-4 py-2 text-right">
                {s.price != null ? `$${s.price.toFixed(2)}` : "—"}
              </td>
              <td className="px-4 py-2 text-right">
                {s.nextDate ? new Date(s.nextDate).toLocaleDateString() : "—"}
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/subscriptions?id=${s.id}`}
                    className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => onDelete(s.id)}
                    disabled={busyId === s.id}
                    className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 disabled:opacity-60"
                  >
                    {busyId === s.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
