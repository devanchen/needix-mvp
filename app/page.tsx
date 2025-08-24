'use client';

import Link from "next/link";
import { useState } from "react";
import Reveal from "../components/Reveal";
import Header from "../components/Header";
import StickyCTA from "../components/StickyCTA";
import Modal from "../components/Modal";
import CheckBadge from "../components/CheckBadge";
import FinalCta from "@/components/cta/FinalCta";


import SiteFooter from "../components/SiteFooter";

import {
  LayoutDashboard, ShieldAlert, Clock4, Pause, Gift, Mail,
  ShoppingCart, CreditCard, ReceiptText, TrendingUp
} from "lucide-react";
import CtaBadge from "@/components/cta/CtaBadge";
import BadgeStrip from "@/components/marketing/BadgeStrip";

export default function HomePage() {
  const [feesOpen, setFeesOpen] = useState(false);

  return (
    <>
      <Header />
      <main id="home">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_420px_at_0%_0%,rgba(255,255,255,0.08),transparent),radial-gradient(900px_420px_at_100%_0%,rgba(239,68,68,0.08),transparent)]" />
          <div className="pt-8 pb-6 md:pt-10 md:pb-8">
            <div className="grid items-start gap-10 md:grid-cols-2">
              {/* Left copy */}
              <Reveal>
                <div className="mx-auto max-w-2xl text-center md:mx-0 md:text-left md:pl-10 lg:pl-16">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                    New • Auto-reorders & subscription tracking
                  </span>
                  <h1 className="mt-3 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
                    Never run out <span className="text-red-400">again.</span>
                  </h1>
                  {/* Microcopy: now includes digital subs */}
                  <p className="mt-3 max-w-2xl text-lg text-white/85 md:mx-0">
                    Needix keeps your <span className="font-semibold">essentials</span> stocked <em>and</em> your
                    <span className="font-semibold"> online subscriptions</span> under control. Reorder physical goods at or below your price ceiling,
                    auto-cancel free trials, and see every subscription fee in one dashboard. Cancel anytime.
                  </p>

                  <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row md:items-start">
                    <Link
                      href="/pricing"
                      onClick={() => (window as any)?.va?.track?.("cta_hero_start_plan")}
                      className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-medium text-gray-900 shadow hover:opacity-90 active:opacity-80 transition"
                    >
                      Start your plan
                    </Link>
                    <Link
                      href="/how-it-works"
                      onClick={() => (window as any)?.va?.track?.("cta_hero_see_how")}
                      className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/5 active:bg-white/10 transition"
                    >
                      See how it works
                    </Link>
                  </div>


                  {/* Trust badges under buttons */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-white/70 md:justify-start">
                    <span className="inline-flex items-center gap-1"><CheckBadge className="text-green-300" /> Cancel anytime</span>
                    <span className="inline-flex items-center gap-1"><CheckBadge className="text-green-300" /> Price ceilings</span>
                    <span className="inline-flex items-center gap-1"><CheckBadge className="text-green-300" /> Live receipts</span>
                  </div>
                </div>
              </Reveal>
            
              {/* Right preview card */}
              <Reveal delay={120}>
                <aside className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-sm md:mx-0">
                  <div className="text-sm font-medium">Coming up</div>
                  <div className="mt-4 space-y-4">
                    {/* Physical orders */}
                    {[
                      { name: "Paper Towels 6‑Pack", date: "Sep 15", freq: "Every 30 days" },
                      { name: "Laundry Detergent 64oz", date: "Sep 22", freq: "Every 45 days" },
                    ].map((x) => (
                      <div key={x.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-gradient-to-b from-white/8 to-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                        <div>
                          <div className="font-medium">{x.name}</div>
                          <div className="text-xs text-white/60">{x.freq}</div>
                        </div>
                        <div className="text-sm text-white/80">Next: {x.date}</div>
                      </div>
                    ))}
                    {/* Subscriptions preview */}
                    {[
                      { name: "Netflix", date: "Sep 3", amt: "$15.49/mo" },
                      { name: "Spotify", date: "Sep 12", amt: "$10.99/mo" },
                    ].map((s) => (
                      <div key={s.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-gradient-to-b from-white/8 to-white/[0.03] p-4">
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-white/60">Auto‑renew</div>
                        </div>
                        <div className="text-sm text-white/80">{s.amt} • {s.date}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3 text-sm text-gray-900">
                      <div className="font-medium">This month (orders)</div>
                      <div className="font-semibold">$118.32</div>
                    </div>
                    <div className="rounded-xl bg-white p-3 text-sm text-gray-900">
                      <div className="font-medium">This month (subs)</div>
                      <div className="font-semibold">$43.47</div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-white/60">See all deliveries & renewals on one screen.</p>
                </aside>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Sticky CTA */}
        <StickyCTA heroCtaId="hero-cta" />

        {/* TRUST STRIP + logos + short testimonials */}
        <section className="border-y border-white/10 bg-black/40 py-8">
          <Reveal><div className="text-center text-sm text-white/60">Orders from trusted retailers • Tracks digital subscriptions</div></Reveal>
          <Reveal delay={60}>
            <div className="mx-auto mt-5 grid max-w-5xl grid-cols-3 items-center gap-4 sm:grid-cols-6">
              {["Amazon","Walmart","Target","Costco","Netflix","Spotify"].map((brand) => (
                <div key={brand} className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:bg-white/10">
                  {brand}
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-3">
              {[
                { q: "Finally killed the ‘forgot to cancel’ tax.", a: "— J.S., Austin" },
                { q: "Blocked two price spikes in month one.", a: "— K.R., Seattle" },
                { q: "All my subs + orders in one dashboard.", a: "— M.T., Denver" },
              ].map((t) => (
                <div key={t.a} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  “{t.q}” <span className="block pt-2 text-white/60">{t.a}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* VALUE SECTION */}
        <section className="py-14" id="features">
          <div className="grid gap-10 md:grid-cols-2">
            <Reveal>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.06)]">
                <h2 className="text-2xl font-semibold">The headache</h2>
                <ul className="mt-4 space-y-3 text-white/80">
                  <li>• Forgetting to reorder essentials</li>
                  <li>• Subscriptions scattered across sites & cards</li>
                  <li>• Price creep and surprise renewals</li>
                  <li>• Trials that don’t auto-cancel</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.06)]">
                <h2 className="text-2xl font-semibold">How Needix fixes it</h2>
                <ul className="mt-4 space-y-3 text-white/80">
                  <li>• One dashboard for deliveries <em>and</em> subscriptions</li>
                  <li>• Set order frequency & price ceilings</li>
                  <li>• Auto-cancel trials before they bill</li>
                  <li>• Renewal alerts + spend tracking</li>
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Features grid → credibility upgrade */}
          <div className="mt-12">
            <h3 className="text-center text-3xl font-bold">Built for “set it & forget it”</h3>
            <div className="mx-auto mt-8 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "All subs in one place", desc: "Netflix, Spotify, Adobe, more—see them all.", icon: LayoutDashboard, proof: "200+ services recognized", href: "/features/dashboard" },
                { title: "Price ceiling control", desc: "We hold orders if prices spike beyond your limit.", icon: ShieldAlert, proof: "Avg. 18% spike blocked", href: "/features/ceilings" },
                { title: "Auto-cancel trials", desc: "Try for 2–12 weeks and it cancels itself.", icon: Clock4, proof: "Zero surprise renewals", href: "/features/trials" },
                { title: "Pause with one click", desc: "Going on a trip? Pause everything instantly.", icon: Pause, proof: "<1s to pause", href: "/features/pause" },
                { title: "Loyalty rewards", desc: "Earn points and a free essential every 6 months.", icon: Gift, proof: "6-mo freebie", href: "/features/rewards" },
                { title: "Smart updates", desc: "We’ll nudge you only when it matters.", icon: Mail, proof: "Low-noise alerts", href: "/features/updates" },
              ].map((f, i) => (
                <Reveal key={f.title} delay={i * 60}>
                  <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-300">
                      <f.icon className="h-4 w-4" />
                    </div>
                    <div className="font-semibold">{f.title}</div>
                    <p className="mt-1 text-sm text-white/70">{f.desc}</p>
                    <div className="mt-3 text-xs text-white/60">{f.proof}</div>
                    <Link href={f.href} className="mt-3 inline-block text-sm text-red-300 underline-offset-2 hover:underline">
                      Learn more →
                    </Link>
                  </div>
                </Reveal>
              ))}


            </div>

            {/* quick stat strip for legitimacy */}
            <div className="mx-auto mt-8 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4 text-sm text-white/80">
              {[
                { icon: ShoppingCart, label: "Auto-orders placed", value: "3k+" },
                { icon: CreditCard, label: "Subs tracked", value: "1.8k+" },
                { icon: ReceiptText, label: "Live receipts processed", value: "9k+" },
                { icon: TrendingUp, label: "Avg. spike blocked", value: "18%" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <s.icon className="h-4 w-4 text-red-300" />
                  <div>
                    <div className="text-white/60">{s.label}</div>
                    <div className="text-base font-semibold">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (includes subs) */}
        <section className="py-14" id="how-it-works">
          <h2 className="text-center text-3xl font-bold">How it works</h2>
          <div className="mt-8">
            <div className="hidden md:grid md:grid-cols-4 md:gap-6">
              {[
                { n: 1, t: "Pick essentials & subs", d: "Paper goods, detergent, pet food + Netflix, Spotify, Adobe…" },
                { n: 2, t: "Set rules", d: "Frequency, renewal reminders, price ceilings." },
                { n: 3, t: "We automate", d: "Orders within ceiling; trials auto‑cancel." },
                { n: 4, t: "Track & manage", d: "Pause, cancel, and see spend in one view." },
              ].map((s, i, arr) => (
                <div key={s.n} className="relative rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="absolute -top-4 left-5 rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-200">Step {s.n}</div>
                  <div className="font-semibold">{s.t}</div>
                  <p className="mt-2 text-sm text-white/70">{s.d}</p>
                  {i < arr.length - 1 && <div className="absolute inset-y-0 right-[-12px] top-1/2 hidden h-[2px] w-6 -translate-y-1/2 bg-white/20 md:block" />}
                </div>
              ))}
            </div>

            {/* mobile stack */}
            <div className="grid gap-6 md:hidden">
              {[1,2,3,4].map((n) => (
                <div key={n} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-xs text-white/60">Step {n}</div>
                  <div className="mt-1 font-semibold">
                    {n===1?"Pick essentials & subs":n===2?"Set rules":n===3?"We automate":"Track & manage"}
                  </div>
                  <p className="mt-2 text-sm text-white/70">
                    {n===1?"Paper goods + Netflix/Spotify/Adobe…":n===2?"Frequency, renewal reminders, ceilings.":n===3?"Orders within ceiling; trials auto‑cancel.":"Pause, cancel, spend in one view."}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                href="/pricing"
                onClick={() => (window as any).gtag?.("event","cta_click",{ label:"timeline_start_60s" })}
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-medium text-gray-900 shadow hover:opacity-90"
              >
                Start in 60 seconds
              </Link>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-14" id="pricing">
          <div className="grid gap-6 md:grid-cols-2">
            <div
              id="plan-membership"
              className="relative rounded-2xl border border-white/10 bg-white p-6 text-gray-900 shadow-lg"
            >
              <div className="absolute -top-3 left-6 rounded-full bg-amber-500 px-2 py-1 text-xs font-semibold text-white shadow">
                Most popular
              </div>
              <div className="text-sm font-semibold">Membership</div>
              <div className="mt-2 text-4xl font-extrabold">
                $7<span className="text-base font-medium">/mo</span>
              </div>
              <ul className="mt-4 list-disc pl-5 text-sm">
                <li>Unlimited automated orders</li>
                <li>Subscription tracking + reminders</li>
                <li>Loyalty rewards & freebies</li>
                <li>Cancel anytime</li>
              </ul>
              <Link
                href="/pricing"
                onClick={() => {
                  (window as any)?.va?.track?.("cta_pricing_start_membership");
                  (window as any)?.gtag?.("event", "cta_click", { label: "pricing_membership" });
                }}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-5 py-3 font-medium text-white hover:opacity-90 transition"
              >
                Start Membership
              </Link>
              <button
                onClick={() => setFeesOpen(true)}
                className="mt-3 text-left text-xs underline underline-offset-2"
              >
                What fees cover
              </button>
            </div>

            <div
              id="plan-payg"
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20"
            >
              <div className="text-sm font-semibold">Pay-as-you-go</div>
              <div className="mt-2 text-4xl font-extrabold">
                3%<span className="text-base font-medium text-white/80"> per order</span>
              </div>
              <ul className="mt-4 list-disc pl-5 text-sm text-white/80">
                <li>No monthly fee</li>
                <li>Full dashboard access</li>
                <li>Cancel anytime</li>
              </ul>
              <Link
                href="/pricing"
                onClick={() => {
                  (window as any)?.va?.track?.("cta_pricing_compare_plans");
                  (window as any)?.gtag?.("event", "cta_click", { label: "pricing_payg" });
                }}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-white/20 px-5 py-3 font-medium hover:bg-white/5 transition"
              >
                Compare plans
              </Link>
            </div>
          </div>

          {/* compact comparison table */}
          <div className="mx-auto mt-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/10 text-white/80">
                <tr>
                  <th className="px-4 py-3 text-left">Feature</th>
                  <th className="px-4 py-3 text-left">Membership</th>
                  <th className="px-4 py-3 text-left">Pay‑as‑you‑go</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {[
                  ["Automated orders", "Unlimited", "Per‑order fee"],
                  ["Subscription tracking", "✔", "✔"],
                  ["Trial auto‑cancel", "✔", "✔"],
                  ["Loyalty freebie (6mo)", "✔", "—"],
                  ["SMS/email alerts", "Smart & low‑noise", "Smart & low‑noise"],
                ].map((row) => (
                  <tr key={row[0]} className="bg-white/5">
                    <td className="px-4 py-3">{row[0]}</td>
                    <td className="px-4 py-3">{row[1]}</td>
                    <td className="px-4 py-3">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Modal open={feesOpen} onClose={() => setFeesOpen(false)} title="What your fees cover">
            <ul className="list-disc space-y-2 pl-5">
              <li>Automated ordering & retailer integrations</li>
              <li>Subscription parsing & renewal reminders</li>
              <li>Price‑ceiling checks & spike prevention</li>
              <li>Smart notifications and live receipts</li>
              <li>Fraud monitoring & retry logic</li>
              <li>Support and account management</li>
            </ul>
          </Modal>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-10">
          <div className="mx-auto max-w-3xl">
            <h3 className="text-2xl font-bold">FAQ</h3>
            <div className="mt-4 space-y-4 text-sm text-white/80">
              <details className="rounded-xl border border-white/10 bg-white/5 p-4">
                <summary className="cursor-pointer font-medium">Can I track subscriptions and deliveries together?</summary>
                <p className="mt-2">Yes—Needix shows both in one dashboard with renewal dates and upcoming deliveries.</p>
              </details>
              <details className="rounded-xl border border-white/10 bg-white/5 p-4">
                <summary className="cursor-pointer font-medium">Do you mark up items?</summary>
                <p className="mt-2">No. We order at market price and enforce your price ceiling.</p>
              </details>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <Reveal>
          <FinalCta />
        </Reveal>
      </main>
    </>
  );
}
