// components/subscriptions/SubscriptionForm.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { showToast } from "@/lib/toast";

export default function SubscriptionForm() {
  const router = useRouter();
  const dateRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    service: "",
    plan: "",
    manageUrl: "",
    price: "",
    nextDate: "",
  });
  const [loading, setLoading] = useState(false);

  // block past dates
  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    // ---- Optimistic row ----
    const tempId = `temp_${Date.now()}`;
    const optimistic = {
      id: tempId,
      userId: "local",
      service: form.service.trim(),
      plan: form.plan.trim() || null,
      manageUrl: form.manageUrl.trim() || null,
      price: form.price.trim() === "" ? null : Number(form.price),
      nextDate: form.nextDate ? new Date(form.nextDate).toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __optimistic: true as const,
    };

    // Fire a global event so the list can insert immediately
    if (optimistic.service) {
      window.dispatchEvent(new CustomEvent("sub:created", { detail: optimistic }));
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: optimistic.service,
          plan: optimistic.plan,
          manageUrl: optimistic.manageUrl,
          price: optimistic.price,
          nextDate: form.nextDate || null, // YYYY-MM-DD
        }),
      });

      if (!res.ok) {
        // revert the optimistic row
        window.dispatchEvent(new CustomEvent("sub:revert", { detail: { tempId } }));
        console.error("Failed to create subscription:", await res.text());
        showToast("Failed to add subscription");
        return;
      }

      const real = await res.json();
      // replace temp row with real row from the server
      window.dispatchEvent(new CustomEvent("sub:replace", { detail: { tempId, row: real } }));

      showToast("Subscription added");
      setForm({ service: "", plan: "", manageUrl: "", price: "", nextDate: "" });

      // Refresh to update summary cards / totals in the page header
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* Service */}
      <input
        type="text"
        placeholder="Service (e.g., Netflix)"
        className="rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm outline-none"
        value={form.service}
        onChange={(e) => setForm({ ...form, service: e.target.value })}
        required
      />

      {/* Plan (optional) */}
      <input
        type="text"
        placeholder="Plan (optional)"
        className="rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm outline-none"
        value={form.plan}
        onChange={(e) => setForm({ ...form, plan: e.target.value })}
      />

      {/* Manage URL (optional) */}
      <input
        type="url"
        placeholder="Manage URL (optional)"
        className="rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm outline-none sm:col-span-2"
        value={form.manageUrl}
        onChange={(e) => setForm({ ...form, manageUrl: e.target.value })}
      />

      {/* Price */}
      <input
        type="number"
        step="0.01"
        inputMode="decimal"
        placeholder="Price (e.g., 15.99)"
        className="rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm outline-none"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />

      {/* Next date with custom white calendar button */}
      <div className="relative">
        <input
          ref={dateRef}
          type="date"
          min={today}
          placeholder="mm/dd/yyyy"
          className="peer w-full rounded-xl border border-white/15 bg-transparent px-3 py-2 pr-10 text-sm outline-none"
          value={form.nextDate}
          onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
        />
        <button
          type="button"
          aria-label="Open date picker"
          onClick={() => dateRef.current?.showPicker?.()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-white/10 focus-visible:outline-none"
          tabIndex={-1}
        >
          <Calendar className="h-4 w-4 text-white opacity-90" />
        </button>
      </div>

      {/* Submit */}
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
