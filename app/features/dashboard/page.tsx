import Link from "next/link";

export default function DashboardFeature() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold">All subs in one place</h1>
      <p className="mt-4 text-lg text-white/80">
        Needix pulls your recurring world into one view—paper goods and pantry refills
        alongside Netflix, Spotify, Adobe, and more. See upcoming deliveries, renewal dates,
        and monthly totals without hopping between apps.
      </p>
      <ul className="mt-6 list-disc pl-5 text-white/75">
        <li>200+ services recognized automatically</li>
        <li>Unified timeline for deliveries and renewals</li>
        <li>Live receipts with vendor, amount, and date</li>
        <li>CSV export and monthly rollups by category</li>
      </ul>
      <div className="mt-8">
        <Link href="/" className="text-red-300 underline-offset-2 hover:underline">← Back to home</Link>
      </div>
    </main>
  );
}
