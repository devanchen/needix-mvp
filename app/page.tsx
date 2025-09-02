// app/page.tsx
import Link from "next/link";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);

  return (
    <main className="relative mx-auto max-w-7xl px-4 pt-20 pb-16">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-40 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18),transparent_60%)] blur-2xl" />
        <div className="absolute top-52 -right-40 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16),transparent_60%)] blur-2xl" />
      </div>

      {/* Hero */}
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <span>✨ New</span>
            <span className="text-white/60">Subscription reminders & tracking</span>
          </div>

          <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
            Keep every subscription{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
              under control.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-white/80">
            One dashboard for Netflix, Spotify, Prime, and more. Set price ceilings, see upcoming
            renewals, and jump to providers to manage or cancel—no more surprise charges.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {signedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-medium hover:bg-emerald-400/15"
                >
                  Go to dashboard
                </Link>
                <Link
                  href="/subscriptions?new=1"
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/[0.08]"
                >
                  Add a subscription
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-medium hover:bg-emerald-400/15"
                >
                  Get started — it’s free
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/[0.08]"
                >
                  Pricing
                </Link>
              </>
            )}
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-white/60">
            <div>🔔 Email reminders</div>
            <div>🧾 Manage / cancel links</div>
            <div>🛡️ Your data, your control</div>
          </div>
        </div>

        {/* Preview card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl">
          <div className="text-sm font-semibold">Upcoming renewals</div>
          <div className="mt-3 space-y-2 text-sm">
            {[
              { icon: "🅽", name: "Netflix — Standard", when: "Tomorrow", price: "$15.49" },
              { icon: "🅢", name: "Spotify — Premium", when: "In 3 days", price: "$10.99" },
              { icon: "🅒", name: "Costco — Annual", when: "Next week", price: "$60.00" },
              { icon: "🅖", name: "ChatGPT — Plus", when: "Today", price: "$20.00" },
            ].map((x) => (
              <div key={x.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{x.icon}</span>
                  <span>{x.name}</span>
                </div>
                <div className="text-white/70">{x.when} • {x.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold">Why Needix?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: "Email reminders", d: "Get notified before each renewal so you can decide to keep or cancel.", e: "📧" },
            { t: "Manage links", d: "Jump straight to the provider page for quick changes or cancellation.", e: "🔗" },
            { t: "Price ceilings", d: "Set a max you’re willing to pay and track increases over time.", e: "💸" },
            { t: "Import from Gmail", d: "Detect subscriptions automatically from receipts in your inbox.", e: "📥" },
            { t: "Fast & private", d: "We only store what’s needed to power reminders and your dashboard.", e: "🔒" },
            { t: "Works anywhere", d: "Mobile-friendly design with add/edit in seconds.", e: "📱" },
          ].map((f) => (
            <div key={f.t} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-2xl">{f.e}</div>
              <div className="mt-1 font-medium">{f.t}</div>
              <div className="text-sm text-white/70">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold">How it works</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { s: "1", t: "Connect or add", d: "Import from Gmail or add subscriptions manually." },
            { s: "2", t: "Set reminders", d: "Pick your renewal date and we’ll ping you ahead of time." },
            { s: "3", t: "Stay in control", d: "See everything in one place and cancel with one click." },
          ].map((x) => (
            <li key={x.s} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-sm font-semibold">Step {x.s}</div>
              <div className="mt-1">{x.t}</div>
              <div className="text-sm text-white/70">{x.d}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-center">
        <div className="text-xl font-semibold">Ready to stop overpaying?</div>
        <div className="mt-1 text-sm text-white/80">Join Needix and get smart reminders.</div>
        <div className="mt-4">
          {signedIn ? (
            <Link
              href="/subscriptions?new=1"
              className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Add your first subscription
            </Link>
          ) : (
            <Link
              href="/signin"
              className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Get started
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
