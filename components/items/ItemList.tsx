// components/items/ItemList.tsx
"use client";

import { useRouter } from "next/navigation";
import type { Item } from "@prisma/client";

export default function ItemList({ initialItems }: { initialItems: Item[] }) {
  const r = useRouter();

  async function del(id: string) {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (res.ok) r.refresh();
    else alert("Failed to delete");
  }

  async function quickEdit(id: string) {
    const ceilingStr = prompt("New price ceiling (e.g., 19.99):");
    if (!ceilingStr) return;
    const ceiling = Number(ceilingStr);
    if (!Number.isFinite(ceiling) || ceiling <= 0) return alert("Invalid number.");
    const res = await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ priceCeiling: ceiling }),
    });
    if (res.ok) r.refresh();
    else alert("Failed to update");
  }

  if (!initialItems.length)
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
        No items yet.
      </div>
    );

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
      <table className="min-w-full text-sm">
        <thead className="text-left text-white/70">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Retailer</th>
            <th className="px-4 py-3">Price ceiling</th>
            <th className="px-4 py-3">Next date</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {initialItems.map((it) => (
            <tr key={it.id} className="border-t border-white/10">
              <td className="px-4 py-3">
                <div className="font-medium">{it.name}</div>
                <a className="text-white/60 underline" href={it.productUrl} target="_blank">
                  Open product →
                </a>
              </td>
              <td className="px-4 py-3">{it.retailer}</td>
              <td className="px-4 py-3">${it.priceCeiling.toString()}</td>
              <td className="px-4 py-3">{new Date(it.nextDate).toLocaleDateString()}</td>
              <td className="px-4 py-3 space-x-2 text-right">
                <button
                  onClick={() => quickEdit(it.id)}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/5"
                >
                  Edit
                </button>
                <button
                  onClick={() => del(it.id)}
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
