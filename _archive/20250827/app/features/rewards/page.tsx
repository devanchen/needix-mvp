import Link from "next/link";

export default function RewardsFeature() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold">Loyalty rewards</h1>
      <p className="mt-4 text-lg text-white/80">
        Earn points as your automated orders run, then redeem for staples you actually use.
        Stick with Needix for six months and get a free essential on us.
      </p>
      <ul className="mt-6 list-disc pl-5 text-white/75">
        <li>Points on every automated order</li>
        <li>Free essential every 6 months of active use</li>
        <li>Bonus streaks for on‑time confirmations</li>
        <li>Transparent redemption—no gimmicks</li>
      </ul>
      <div className="mt-8">
        <Link href="/" className="text-red-300 underline-offset-2 hover:underline">← Back to home</Link>
      </div>
    </main>
  );
}
