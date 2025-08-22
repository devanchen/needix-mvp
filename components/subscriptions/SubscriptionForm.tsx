// components/subscriptions/SubscriptionForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionForm() {
  const r = useRouter();
  const [form, setForm] = useState({
    service: "",
    plan: "",
    manageUrl: "",
    price: "",
    nextDate: "",
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(form.price);

    if (!form.service || !form.nextDate) {
      alert("Please fill service name and next date.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      alert("Enter a valid price (0 or more).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          service: form.service.trim(),
          plan: form.plan.trim() || null,
          manageUrl: form.manageUrl.trim() || null,
          price,
          nextDate: form.nextDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to add subscription");

      setForm({ service: "", plan: "", manageUrl: "", price: "", nextDate: "" });
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
        placeholder="Service (e.g., Netflix)"
        value={form.service}
        onChange={(e) => setForm({ ...form, service: e.target.value })}
      />
      <input
        className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
        placeholder="Plan (optional)"
        value={form.plan}
        onChange={(e) => setForm({ ...form, plan: e.target.value })}
      />
      <input
        className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none sm:col-span-2"
        placeholder="Manage URL (optional)"
        value={form.manageUrl}
        onChange={(e) => setForm({ ...form, manageUrl: e.target.value })}
      />
      <input
        type="number"
        step="0.01"
        min="0"
        className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
        placeholder="Price (e.g., 15.99)"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
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
          {loading ? "Adding…" : "Add subscription"}
        </button>
      </div>
    </form>
  );
}
