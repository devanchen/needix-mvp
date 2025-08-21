export const metadata = {
  title: "How it works — Needix",
  description:
    "Set your schedule, set a price ceiling, and let Needix handle the rest.",
};

export default function HowItWorksPage() {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold">How it works</h1>
          <p className="mt-3 text-white/70">
            From setup to first reorder—usually under 3 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              n: 1,
              t: "Pick essentials",
              d: "Toilet paper, paper towels, detergent, pet food, coffee, and more.",
            },
            {
              n: 2,
              t: "Set schedule",
              d: "Weekly, monthly, or custom intervals. Pause or adjust anytime.",
            },
            {
              n: 3,
              t: "Set price ceiling",
              d: "Protect yourself from random price spikes—we hold and notify you if exceeded.",
            },
            {
              n: 4,
              t: "We auto-order",
              d: "We place the order through partnered retailers and send you the receipt.",
            },
            {
              n: 5,
              t: "Track & control",
              d: "One dashboard to see upcoming deliveries, spend, and cancellations.",
            },
            {
              n: 6,
              t: "Loyalty bonus",
              d: "Every 6 months of active use, get a free essential on us.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20"
            >
              <div className="text-xs text-white/60">Step {s.n}</div>
              <div className="mt-1 font-semibold">{s.t}</div>
              <p className="mt-2 text-white/70">{s.d}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white p-8 text-center text-gray-900 shadow-lg">
          <h3 className="text-2xl font-bold">Ready to try it?</h3>
          <p className="mt-2 text-gray-700">
            Start with pay-as-you-go or become a member—cancel anytime.
          </p>
          <a
            href="/pricing"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 font-medium text-white hover:opacity-90 transition"
          >
            View pricing
          </a>
        </div>
      </div>
    </section>
  );
}
