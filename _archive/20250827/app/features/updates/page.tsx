import Link from "next/link";

export default function UpdatesFeature() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold">Smart updates</h1>
      <p className="mt-4 text-lg text-white/80">
        Fewer pings, more signal. You’ll only hear from us when it matters—price spikes,
        declined payments, trial endings, and a calm weekly digest.
      </p>
      <ul className="mt-6 list-disc pl-5 text-white/75">
        <li>Critical alerts for spikes, declines, and renewals</li>
        <li>Low‑noise weekly digest with upcoming items</li>
        <li>Email, SMS, and (soon) push notifications</li>
        <li>Granular notification preferences</li>
      </ul>
      <div className="mt-8">
        <Link href="/" className="text-red-300 underline-offset-2 hover:underline">← Back to home</Link>
      </div>
    </main>
  );
}
