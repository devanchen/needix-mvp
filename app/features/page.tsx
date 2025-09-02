// app/features/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function FeaturesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pt-16 pb-20">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <div className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18),transparent_60%)] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18),transparent_60%)] blur-2xl" />
        <h1 className="text-3xl font-extrabold md:text-4xl">
          Everything you need to{" "}
          <span className="bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
            control subscriptions
          </span>
          .
        </h1>
        <p className="mt-3 max-w-2xl text-white/80">
          Needix brings your recurring charges into one tidy dashboard and taps you on the shoulder
          before renewals—so you can cancel, change plans, or set a price ceiling.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/subscriptions?new=1"
            className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-medium hover:bg-emerald-400/15"
          >
            Add your first subscription
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/[0.08]"
          >
            See pricing
          </Link>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">Highlights</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              e: "🔔",
              t: "Smart reminders",
              d: "Email reminders before each renewal—never get surprised again.",
            },
            {
              e: "📥",
              t: "Gmail import",
              d: "Detect subscriptions automatically from receipts. You choose what to keep.",
            },
            {
              e: "🔗",
              t: "One-click manage links",
              d: "Jump straight to provider pages to change plans or cancel.",
            },
            {
              e: "💸",
              t: "Price ceilings",
              d: "Track increases and set a maximum you’re willing to pay.",
            },
            {
              e: "📊",
              t: "Monthly total",
              d: "See your real monthly cost—annual and weekly plans normalized.",
            },
            {
              e: "🔒",
              t: "Private by design",
              d: "We keep only what’s needed to power reminders and your dashboard.",
            },
          ].map((f) => (
            <div
              key={f.t}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.06]"
            >
              <div className="text-2xl">{f.e}</div>
              <div className="mt-2 font-semibold">{f.t}</div>
              <p className="text-sm text-white/70">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              s: "1",
              t: "Connect or add",
              d: "Import from Gmail or add subscriptions manually in seconds.",
            },
            { s: "2", t: "Set reminders", d: "Choose your renewal date and we’ll ping you ahead of time." },
            {
              s: "3",
              t: "Stay in control",
              d: "All subscriptions in one place with quick manage/cancel links.",
            },
          ].map((x) => (
            <div
              key={x.s}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.06]"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-white/70">Step {x.s}</div>
              <div className="mt-1 text-lg font-medium">{x.t}</div>
              <p className="text-sm text-white/70">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST / SOCIAL PROOF */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold">You’re in good company</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            {
              q: "I cancelled two forgotten trials and saved more than Needix costs for the year.",
              a: "— Alex R.",
            },
            {
              q: "The Gmail import surfaced subscriptions I totally missed. Worth it.",
              a: "— Priya S.",
            },
            {
              q: "Love the reminders. One dashboard to rule all my recurring stuff.",
              a: "— Marco D.",
            },
          ].map((t, i) => (
            <blockquote
              key={i}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/80"
            >
              “{t.q}” <span className="block pt-2 text-white/60">{t.a}</span>
            </blockquote>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-center">
        <div className="text-xl font-semibold">Ready to take control?</div>
        <div className="mt-1 text-sm text-white/80">Start free—add your first subscription in under a minute.</div>
        <div className="mt-4">
          <Link
            href="/signin"
            className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
          >
            Get started
          </Link>
        </div>
      </section>
    </main>
  );
}
