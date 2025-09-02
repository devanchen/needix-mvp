// app/faq/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const QA = [
  {
    q: "What is Needix?",
    a: "Needix tracks your subscriptions in one place, reminds you before renewals, and links you directly to providers so you can change plans or cancel fast.",
  },
  {
    q: "How do reminders work?",
    a: "You choose a renewal date for each subscription and Needix emails you beforehand so you can decide to keep it or cancel.",
  },
  {
    q: "Do you read my emails?",
    a: "If you enable Gmail import, Needix looks for receipts/renewals to suggest subscriptions—nothing else. You’re always in control of what gets added.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. Cancel your Needix membership any time. Plus, there’s a 30-day money-back guarantee.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. We store only what’s needed to power reminders and your dashboard. You can delete subscriptions at any time.",
  },
  {
    q: "How much does it cost?",
    a: "Start free. Needix Plus adds Gmail import, price ceilings, and priority support for $4.99/month.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-16 pb-20">
      <h1 className="text-3xl font-extrabold">Questions</h1>
      <p className="mt-2 text-white/80">
        Short answers to the most common questions. Still unsure?{" "}
        <a className="underline" href="mailto:hello@needix.app">
          Email us
        </a>
        .
      </p>

      <div className="mt-8 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04]">
        {QA.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
              <span className="font-medium">{item.q}</span>
              <span className="transition group-open:rotate-180">⌄</span>
            </summary>
            <div className="px-5 pb-5 text-sm text-white/80">{item.a}</div>
          </details>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/pricing"
          className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-medium hover:bg-emerald-400/15"
        >
          See pricing
        </Link>
      </div>
    </main>
  );
}
