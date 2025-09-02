// app/pricing/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SavingsEstimator from "@/components/pricing/SavingsEstimator";
import CheckoutButton from "@/components/pricing/CheckoutButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PLUS_FEATURES = [
  "Smart email reminders before renewals",
  "Gmail import to auto-detect subscriptions",
  "Price-ceiling tracking & hike alerts",
  "Manage / cancel links for every provider",
  "Monthly total (normalizes annual/weekly)",
  "Priority support",
];

export default async function PricingPage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const membership = userId
    ? await prisma.membership.findUnique({ where: { userId }, select: { status: true } })
    : null;

  const active =
    membership?.status && new Set(["active", "trialing"]).has(membership.status);

  return (
    <main className="mx-auto max-w-7xl px-4 pt-16 pb-20">
      {/* HERO */}
      <section className="text-center">
        <h1 className="text-3xl font-extrabold md:text-4xl">
          One plan. <span className="bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">Pays for itself</span>.
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-white/80">
          Cancel forgettable trials, catch price hikes, and see the full picture before renewals.
          Most people save more in a month than Needix costs.
        </p>
      </section>

      {/* SINGLE PLAN CARD */}
      <section className="mt-10">
        <div className="relative rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6 md:p-8">
          <div className="absolute right-4 top-4 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
            Best value
          </div>

          <div className="md:flex md:items-start md:justify-between">
            <div>
              <div className="text-sm font-semibold text-white/80">Needix Plus</div>
              <div className="mt-2 text-4xl font-extrabold">
                $4.99<span className="text-base font-normal text-white/60">/mo</span>
              </div>
              <div className="mt-1 text-xs text-white/60">Cancel anytime • 30-day money-back guarantee</div>
            </div>

            <div className="mt-5 flex gap-3 md:mt-0">
              {active ? (
                <Link
                  href="/dashboard"
                  className="inline-block rounded-md border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm hover:bg-emerald-400/15"
                >
                  You’re active — go to dashboard
                </Link>
              ) : (
                <>
                  <CheckoutButton />
                  <Link
                    href="/faq"
                    className="inline-block rounded-md border border-white/15 px-4 py-2 text-sm hover:bg-white/[0.08]"
                  >
                    Questions?
                  </Link>
                </>
              )}
            </div>
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {PLUS_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5">✨</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* WHY IT PAYS FOR ITSELF */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-center">Why it pays for itself</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Cancel forgotten trials",
              d: "Stopping even one $9.99 subscription covers two months of Needix.",
              i: "🧹",
            },
            {
              t: "Catch price hikes",
              d: "A single $3/mo increase spotted and capped is more than half the cost.",
              i: "📈",
            },
            {
              t: "Avoid overlap",
              d: "Downgrade or pause duplicates (e.g., two music services) with quick links.",
              i: "🔗",
            },
          ].map((x) => (
            <div key={x.t} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="text-2xl">{x.i}</div>
              <div className="mt-2 font-semibold">{x.t}</div>
              <p className="text-sm text-white/70">{x.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <SavingsEstimator />
        </div>
      </section>

      {/* TRUST & GUARANTEE */}
      <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
        <div className="text-lg font-semibold">🔒 Your money & data are safe</div>
        <p className="mx-auto mt-2 max-w-3xl text-sm text-white/80">
          Cancel with one click. We keep only what’s needed for reminders and your dashboard. If Needix
          isn’t for you, get a full refund within 30 days—no hard feelings.
        </p>
      </section>
    </main>
  );
}
