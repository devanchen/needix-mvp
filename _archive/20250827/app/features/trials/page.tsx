import Link from "next/link";

export default function TrialsFeature() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold">Auto‑cancel trials</h1>
      <p className="mt-4 text-lg text-white/80">
        Try stuff without the “forgot to cancel” tax. We track trial end dates and cancel
        before renewal—or nudge you for one‑tap cancel if you want to keep it.
      </p>
      <ul className="mt-6 list-disc pl-5 text-white/75">
        <li>Automatic trial detection & end‑date tracking</li>
        <li>Auto‑cancel rules or confirm‑to‑cancel reminders</li>
        <li>Emails/SMS a few days before billing</li>
        <li>Clear audit trail in your dashboard</li>
      </ul>
      <p className="mt-4 text-white/70">Goal: zero surprise renewals—period.</p>
      <div className="mt-8">
        <Link href="/" className="text-red-300 underline-offset-2 hover:underline">← Back to home</Link>
      </div>
    </main>
  );
}
