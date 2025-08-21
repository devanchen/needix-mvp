import Link from "next/link";

export const metadata = {
  title: "Pricing — Needix",
  description: "Simple, transparent pricing. Cancel anytime.",
};

export default function PricingPage() {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold">Pricing</h1>
          <p className="mt-3 text-white/70">
            Pick what fits. Change or cancel anytime.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Membership */}
          <div className="rounded-2xl border border-white/10 bg-white p-6 text-gray-900 shadow-lg">
            <div className="text-sm font-semibold">Membership</div>
            <div className="mt-2 text-5xl font-extrabold">
              $7<span className="text-base font-medium">/mo</span>
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              <li>• Unlimited automated orders</li>
              <li>• Price ceiling controls</li>
              <li>• Loyalty rewards & freebies</li>
              <li>• Priority support</li>
              <li>• Cancel anytime</li>
            </ul>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-5 py-3 font-medium text-white hover:opacity-90 transition"
            >
              Start Membership
            </Link>
            <p className="mt-3 text-xs text-gray-600">
              Billed monthly. Taxes may apply.
            </p>
          </div>

          {/* Pay as you go */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
            <div className="text-sm font-semibold text-white">Pay-as-you-go</div>
            <div className="mt-2 text-5xl font-extrabold">
              3%<span className="text-base font-medium text-white/80"> per order</span>
            </div>
            <ul className="mt-5 space-y-2 text-sm text-white/80">
              <li>• No monthly fee</li>
              <li>• Full dashboard access</li>
              <li>• Pause/cancel anytime</li>
              <li>• Email & SMS updates</li>
            </ul>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-white/20 px-5 py-3 font-medium hover:bg-white/5 transition"
            >
              Continue with pay-as-you-go
            </Link>
            <p className="mt-3 text-xs text-white/60">
              3% is applied to the order subtotal we place on your behalf.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {[
            {
              q: "Can I cancel anytime?",
              a: "Yes. You can cancel or pause with a single click from your dashboard.",
            },
            {
              q: "What’s a price ceiling?",
              a: "You set a max price for each item. If prices spike over your ceiling, we hold the order and notify you.",
            },
            {
              q: "Do you mark up items?",
              a: "No. We place orders with partnered retailers for the best available price and show you receipts.",
            },
            {
              q: "Where do you ship from?",
              a: "Orders are fulfilled by trusted retailers (Amazon, Walmart, Target, Costco).",
            },
          ].map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20"
            >
              <div className="font-semibold">{f.q}</div>
              <p className="mt-2 text-white/70">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
