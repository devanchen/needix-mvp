import Link from "next/link";

export default function PauseFeature() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold">Pause with one click</h1>
      <p className="mt-4 text-lg text-white/80">
        Traveling or tightening the budget this week? Freeze everything instantly—either
        globally or just specific items and services—and auto‑resume when you’re back.
      </p>
      <ul className="mt-6 list-disc pl-5 text-white/75">
        <li>Global pause or granular per‑item/per‑service controls</li>
        <li>Set an auto‑resume date or resume anytime</li>
        <li>Works for deliveries and digital subscriptions</li>
        <li>Under one second to apply changes</li>
      </ul>
      <div className="mt-8">
        <Link href="/" className="text-red-300 underline-offset-2 hover:underline">← Back to home</Link>
      </div>
    </main>
  );
}
