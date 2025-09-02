// components/subscriptions/SubscriptionForm.tsx
"use client";

import { useState } from "react";

type Values = {
  service: string;
  plan: string;
  price: string; // as text; convert before submit
  nextDate: string; // yyyy-mm-dd
  manageUrl: string;
};

export default function SubscriptionForm({
  initial,
  onSave,
}: {
  initial?: Partial<Values>;
  onSave?: (v: Values) => Promise<void> | void;
}) {
  const [v, setV] = useState<Values>({
    service: initial?.service ?? "",
    plan: initial?.plan ?? "",
    price: initial?.price ?? "",
    nextDate: initial?.nextDate ?? "",
    manageUrl: initial?.manageUrl ?? "",
  });
  const [busy, setBusy] = useState(false);

  function u<K extends keyof Values>(k: K, val: Values[K]) {
    setV((s) => ({ ...s, [k]: val }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setBusy(true);
      await onSave?.(v);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input className="w-full rounded-md border bg-transparent px-3 py-2" placeholder="Service" value={v.service} onChange={(e) => u("service", e.target.value)} />
      <input className="w-full rounded-md border bg-transparent px-3 py-2" placeholder="Plan" value={v.plan} onChange={(e) => u("plan", e.target.value)} />
      <input className="w-full rounded-md border bg-transparent px-3 py-2" placeholder="Price (e.g. 9.99)" inputMode="decimal" value={v.price} onChange={(e) => u("price", e.target.value)} />
      <input className="w-full rounded-md border bg-transparent px-3 py-2" type="date" value={v.nextDate} onChange={(e) => u("nextDate", e.target.value)} />
      <input className="w-full rounded-md border bg-transparent px-3 py-2" placeholder="Manage URL" value={v.manageUrl} onChange={(e) => u("manageUrl", e.target.value)} />
      <button className="rounded-md border px-4 py-2 text-sm hover:bg-accent disabled:opacity-60" disabled={busy} type="submit">
        {busy ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
