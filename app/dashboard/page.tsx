"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type DeliveryItem = {
  id: string;
  name: string;
  retailer: "Amazon" | "Walmart" | "Target" | "Costco";
  nextDate: string; // ISO or "Sep 30"
  freq: string; // e.g., "Every 30 days"
  price: number; // last paid
  priceCeiling: number;
  url: string; // retailer product/cart link
};

type SubscriptionItem = {
  id: string;
  service: string; // e.g., "Spotify Premium"
  plan: string; // e.g., "Family"
  nextDate: string;
  price: number;
  url?: string; // manage/billing link
};

const demoDeliveries: DeliveryItem[] = [
  {
    id: "d1",
    name: "Paper Towels 6-Pack",
    retailer: "Walmart",
    nextDate: "Sep 15",
    freq: "Every 30 days",
    price: 13.49,
    priceCeiling: 15.0,
    url: "https://www.walmart.com/", // TODO: replace with real product link
  },
  {
    id: "d2",
    name: "Laundry Detergent 64oz",
    retailer: "Target",
    nextDate: "Sep 22",
    freq: "Every 45 days",
    price: 11.99,
    priceCeiling: 13.5,
    url: "https://www.target.com/", // TODO
  },
  {
    id: "d3",
    name: "Dog Food 20lb",
    retailer: "Amazon",
    nextDate: "Oct 1",
    freq: "Every 30 days",
    price: 29.99,
    priceCeiling: 32.0,
    url: "https://www.amazon.com/", // TODO
  },
];

const demoSubs: SubscriptionItem[] = [
  { id: "s1", service: "Netflix", plan: "Standard", nextDate: "Sep 19", price: 15.49, url: "https://www.netflix.com/account" },
  { id: "s2", service: "Spotify", plan: "Family", nextDate: "Sep 25", price: 16.99, url: "https://www.spotify.com/account/" },
  { id: "s3", service: "Adobe Creative Cloud", plan: "All Apps", nextDate: "Oct 2", price: 54.99, url: "https://account.adobe.com/plans" },
];

export default function DashboardPage() {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>(demoDeliveries);
  const [subs, setSubs] = useState<SubscriptionItem[]>(demoSubs);
  const [placing, setPlacing] = useState<string | null>(null);

  const totals = useMemo(() => {
    const deliveryMonth = deliveries.reduce((sum, d) => sum + d.price, 0);
    const subMonth = subs.reduce((sum, s) => sum + s.price, 0);
    return {
      monthSpend: +(deliveryMonth + subMonth).toFixed(2),
      itemsTracked: deliveries.length + subs.length,
      spikesBlocked: 4, // placeholder; later compute from events
    };
  }, [deliveries, subs]);

  async function placeOrder(id: string) {
    const item = deliveries.find((d) => d.id === id);
    if (!item) return;
    setPlacing(id);
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          deliveryId: id,
          retailer: item.retailer,
          priceCeiling: item.priceCeiling,
        }),
      });
      // For MVP: send them to the retailer to complete checkout
      window.open(item.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error(e);
      alert("Could not start order. Try again.");
    } finally {
      setPlacing(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Dashboard</h1>
          <p className="mt-1 text-white/70">
            Upcoming deliveries & renewals. Price ceilings apply automatically where supported.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/connect"
            className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
          >
            Connect subscriptions
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:opacity-90"
          >
            Start in 60 seconds
          </Link>
        </div>
      </div>

      {/* Stats */}
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/70">This month’s spend (est.)</div>
          <div className="mt-2 text-3xl font-bold">${totals.monthSpend.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/70">Items & subscriptions tracked</div>
          <div className="mt-2 text-3xl font-bold">{totals.itemsTracked}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/70">Price spikes blocked</div>
          <div className="mt-2 text-3xl font-bold">{totals.spikesBlocked}</div>
        </div>
      </section>

      {/* Upcoming deliveries */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming deliveries</h2>
          <Link href="/features/ceilings" className="text-sm text-red-300 underline-offset-2 hover:underline">
            Learn about price ceilings →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {deliveries.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/8 to-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-xs text-white/60">
                    {d.retailer} • {d.freq}
                  </div>
                </div>
                <div className="text-sm text-white/80">Next: {d.nextDate}</div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-xs text-white/60">Last price</div>
                  <div className="font-medium">${d.price.toFixed(2)}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-xs text-white/60">Price ceiling</div>
                  <div className="font-medium">${d.priceCeiling.toFixed(2)}</div>
                </div>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10"
                >
                  <div className="text-xs text-white/60">Product</div>
                  <div className="font-medium">Open page ↗</div>
                </a>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => placeOrder(d.id)}
                  disabled={placing === d.id}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:opacity-90 disabled:opacity-60"
                >
                  {placing === d.id ? "Starting…" : `Order at ${d.retailer}`}
                </button>
                <Link
                  href="/pricing"
                  className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
                >
                  Edit ceiling
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming renewals */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming renewals</h2>
          <Link href="/features/trials" className="text-sm text-red-300 underline-offset-2 hover:underline">
            Avoid surprise renewals →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {subs.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/8 to-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{s.service}</div>
                  <div className="text-xs text-white/60">{s.plan}</div>
                </div>
                <div className="text-sm text-white/80">Next: {s.nextDate}</div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-xs text-white/60">Monthly</div>
                  <div className="font-medium">${s.price.toFixed(2)}</div>
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10"
                >
                  <div className="text-xs text-white/60">Manage</div>
                  <div className="font-medium">Open billing ↗</div>
                </a>
                <Link
                  href="/connect"
                  className="rounded-lg border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10"
                >
                  <div className="text-xs text-white/60">Source</div>
                  <div className="font-medium">Connected</div>
                </Link>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href="/connect"
                  className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
                >
                  Auto-cancel rules
                </Link>
                <Link
                  href="/features/updates"
                  className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
                >
                  Notification prefs
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
