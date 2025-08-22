// components/subscriptions/SubscriptionList.tsx
"use client";

import { useRouter } from "next/navigation";
import type { Subscription } from "@prisma/client";

export default function SubscriptionList({ initialSubs }: { initialSubs: Subscription[] }) {
  const r = useRouter();

  async function del(id: string) {
    if (!confirm("Delete this subscription?")) return;
    const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    if (res.ok) r.refresh();
    else alert("Failed to delete");
  }

  async function quickEdit(id: string) {
    const priceStr = prompt("New monthly price (e.g., 12.99):");
    if (!priceStr) return;
    const price = Number(priceStr);
    if (!Number.isFinite(price) || price < 0) return alert("Invalid number.");
    const res = await fetch(`/api/subscriptions/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ price }),
    });
    if (res.ok) r.refresh();
    else alert("Failed to update");
  }

  if (!initialSubs.length)
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
        No subscriptions yet.
      </div>
    );

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
      <table className="min-w-full text-sm">
        <thead className="text-left text-white/70">
          <tr>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Plan</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Next date</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {initialSubs.map((s) => (
            <tr key={s.id} className="border-t border-white/10">
              <td className="px-4 py-3">
                <div className="font-medium">{s.service}</div>
                {s.manageUrl ? (
                  <a className="text-white/60 underline" href={s.manageUrl} target="_blank">
                    Manage →
                  </a>
                ) : null}
              </td>
              <td className="px-4 py-3">{s.plan || "—"}</td>
              <td className="px-4 py-3">${s.price.toString()}</td>
              <td className="px-4 py-3">{new Date(s.nextDate).toLocaleDateString()}</td>
              <td className="px-4 py-3 space-x-2 text-right">
                <button
                  onClick={() => quickEdit(s.id)}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/5"
                >
                  Edit
                </button>
                <button
                  onClick={() => del(s.id)}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:opacity-90"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
