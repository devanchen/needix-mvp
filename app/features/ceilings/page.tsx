import Link from "next/link";

export default function CeilingsFeature() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold">Price ceiling control</h1>
      <p className="mt-4 text-lg text-white/80">
        Set a max you’re willing to pay for each item (or category) and we’ll hold the
        order when prices spike. You stay stocked without getting squeezed by surge pricing.
      </p>
      <ul className="mt-6 list-disc pl-5 text-white/75">
        <li>Per‑item and per‑category ceilings</li>
        <li>Smart retry when prices normalize</li>
        <li>Heads‑up alerts only when action’s needed</li>
        <li>No Needix markups—ever</li>
      </ul>
      <p className="mt-4 text-white/70">Pilot users saw an average 18% spike blocked.</p>
      <div className="mt-8">
        <Link href="/" className="text-red-300 underline-offset-2 hover:underline">← Back to home</Link>
      </div>
    </main>
  );
}
