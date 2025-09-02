// components/subscriptions/SubscriptionsClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export type SubscriptionItem = {
  id: string;
  service: string;
  plan: string | null;
  price: number | null; // USD (from Prisma.Decimal -> number)
  nextDate: string | null; // ISO string
  manageUrl: string | null;
  canceled: boolean;
};

type Props = {
  initialSubscriptions: SubscriptionItem[];
  selectedId?: string;
};

export default function SubscriptionsClient({
  initialSubscriptions,
  selectedId,
}: Props) {
  const [subs, setSubs] = useState<SubscriptionItem[]>(initialSubscriptions);

  async function handleDelete(id: string) {
    const ok = window.confirm("Delete this subscription?");
    if (!ok) return;

    const res = await fetch(`/api/subscriptions/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Failed to delete subscription.");
      return;
    }

    setSubs((prev) => prev.filter((s) => s.id !== id));
  }

  if (subs.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-5 text-white/80">
        No subscriptions yet. Click <strong>+ New</strong> to add one, or use{" "}
        <Link className="underline" href="/dashboard">
          the dashboard
        </Link>{" "}
        to explore features.
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-3">
      {subs.map((s) => {
        const isSelected = selectedId === s.id;
        return (
          <div
            key={s.id}
            className={`rounded-xl border border-white/10 bg-white/[0.04] p-4 ${
              isSelected ? "ring-2 ring-white/30" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-medium text-white">
                  {s.service}
                  {s.canceled && (
                    <span className="ml-2 align-middle rounded bg-rose-500/20 px-2 py-0.5 text-xs text-rose-200">
                      Canceled
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-white/70">
                  {s.plan ?? "—"} •{" "}
                  {typeof s.price === "number"
                    ? `$${s.price.toFixed(2)}`
                    : "—"}{" "}
                  •{" "}
                  {s.nextDate
                    ? new Date(s.nextDate).toLocaleDateString()
                    : "—"}
                </div>
                {s.manageUrl && (
                  <a
                    href={s.manageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-white/70 underline"
                  >
                    Manage on provider →
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/subscriptions?id=${s.id}`}
                  className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs text-rose-200 hover:bg-white/15"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
