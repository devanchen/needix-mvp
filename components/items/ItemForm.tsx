// components/items/ItemForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const RETAILERS = ["Amazon", "Walmart", "Target", "Costco", "Other"] as const;

export default function ItemForm() {
  const r = useRouter();
  const [form, setForm] = useState({
    name: "",
    retailer: "Amazon",
    productUrl: "",
    priceCeiling: "",
    lastPrice: "",
    frequencyDays: "30",
    nextDate: "",
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ceiling = Number(form.priceCeiling);
    const last = Number(form.lastPrice || "0");
    const freq = Number(form.frequencyDays || "30");

    if (!form.name || !form.productUrl || !form.nextDate) {
      alert("Please fill name, product URL, and next date.");
      return;
    }
    if (!Number.isFinite(ceiling) || ceiling <= 0) {
      alert("Set a valid price ceiling (e.g., 19.99).");
      return;
    }
    if (!Number.isFinite(freq) || freq < 7) {
      alert("Frequency should be at least 7 days.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          retailer: form.retailer,
          productUrl: form.productUrl.trim(),
          priceCeiling: ceiling,
          lastPrice: last || ceiling,
          frequencyDays: freq,
          nextDate: form.nextDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to add item");
      setForm({
        name: "",
        retailer: "Amazon",
        productUrl: "",
        priceCeiling: "",
        lastPrice: "",
        frequencyDays: "30",
        nextDate: "",
      });
      r.refresh();
    } catch (e: any) {
      alert(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <input
        className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
        placeholder="Item name (e.g., Paper Towels 6-Pack)"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <select
        className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
        value={form.retailer}
        onChange={(e) => setForm({ ...form, retailer: e.target.value })}
      >
        {RETAILERS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <input
        className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none sm:col-span-2"
        placeholder="Product URL"
        value={form.productUrl}
        onChange={(e) => setForm({ ...form, productUrl: e.target.value })}
      />

      <input
        type="number"
        step="0.01"
        min="0"
        className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
        placeholder="Price ceiling (e.g., 19.99)"
        value={form.priceCeiling}
        onChange={(e) => setForm({ ...form, priceCeiling: e.target.value })}
      />
      <input
        type="number"
        step="0.01"
        min="0"
        className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
        placeholder="Last paid price (optional)"
        value={form.lastPrice}
        onChange={(e) => setForm({ ...form, lastPrice: e.target.value })}
      />

      <input
        type="number"
        min="7"
        className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
        placeholder="Frequency (days)"
        value={form.frequencyDays}
        onChange={(e) => setForm({ ...form, frequencyDays: e.target.value })}
      />
      <input
        type="date"
        className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
        value={form.nextDate}
        onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
      />

      <div className="sm:col-span-2">
        <button
          disabled={loading}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Adding…" : "Add item"}
        </button>
      </div>
    </form>
  );
}
