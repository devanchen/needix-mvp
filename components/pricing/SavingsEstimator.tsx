// components/pricing/SavingsEstimator.tsx
"use client";

import { useMemo, useState } from "react";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export default function SavingsEstimator() {
  const [avgPrice, setAvgPrice] = useState<number>(12);          // average subscription price
  const [toCancel, setToCancel] = useState<number>(1);           // subs you’ll cancel/trim
  const [hikesPerYear, setHikesPerYear] = useState<number>(2);   // price increases you’d catch
  const [avgHikePct, setAvgHikePct] = useState<number>(10);      // % size of those hikes

  const monthlySavings = useMemo(() => {
    const cancelSavings = clamp(toCancel, 0, 50) * clamp(avgPrice, 1, 200);
    // Convert annual hike avoidance into monthly value
    const hikeSavingsAnnual = clamp(hikesPerYear, 0, 50) * (clamp(avgPrice, 1, 200) * (clamp(avgHikePct, 0, 200) / 100));
    const hikeSavingsMonthly = hikeSavingsAnnual / 12;
    const total = cancelSavings + hikeSavingsMonthly;
    return Math.max(0, Math.round(total * 100) / 100);
  }, [avgPrice, toCancel, hikesPerYear, avgHikePct]);

  const fee = 4.99;
  const roi = monthlySavings > 0 ? Math.max(1, Math.round((monthlySavings / fee) * 10) / 10) : 0;
  const fmt = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 2 });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="text-center">
        <div className="text-sm font-semibold">Savings estimator</div>
        <div className="mt-1 text-xs text-white/70">
          Adjust the sliders to see how quickly Needix pays for itself.
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {/* Controls */}
        <div className="space-y-5">
          <div>
            <label className="text-xs text-white/70">Average subscription price</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="range"
                min={3}
                max={40}
                value={avgPrice}
                onChange={(e) => setAvgPrice(Number(e.target.value))}
                className="w-full"
              />
              <div className="w-16 text-right text-sm">{fmt.format(avgPrice)}</div>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/70">Subscriptions you’ll cancel/trim</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={10}
                value={toCancel}
                onChange={(e) => setToCancel(Number(e.target.value))}
                className="w-full"
              />
              <div className="w-16 text-right text-sm">{toCancel}</div>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/70">Price increases caught per year</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={12}
                value={hikesPerYear}
                onChange={(e) => setHikesPerYear(Number(e.target.value))}
                className="w-full"
              />
              <div className="w-16 text-right text-sm">{hikesPerYear}</div>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/70">Average increase size</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={40}
                value={avgHikePct}
                onChange={(e) => setAvgHikePct(Number(e.target.value))}
                className="w-full"
              />
              <div className="w-16 text-right text-sm">{avgHikePct}%</div>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="text-xs uppercase tracking-wide text-white/70">Estimated monthly savings</div>
          <div className="mt-1 text-4xl font-extrabold">{fmt.format(monthlySavings)}</div>

          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Needix Plus</span>
              <span className="text-white/80">{fmt.format(4.99)}/mo</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Net after Needix</span>
              <span className="font-semibold text-emerald-300">
                {fmt.format(Math.max(0, monthlySavings - 4.99))}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-center text-sm">
            {monthlySavings <= 0 ? (
              <span>Play with the sliders to estimate your savings.</span>
            ) : (
              <span>
                Estimated ROI: <strong>{roi}×</strong> your monthly fee
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
