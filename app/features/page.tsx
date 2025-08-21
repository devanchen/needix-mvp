import Link from "next/link";
import { FEATURES } from "@/lib/features";

export const metadata = { title: "Features • Needix" };

export default function FeaturesIndexPage() {
  const entries = Object.entries(FEATURES) as [keyof typeof FEATURES, (typeof FEATURES)[keyof typeof FEATURES]][];

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-extrabold">Features</h1>
      <p className="mt-2 text-white/75">Dive deeper into how Needix works for deliveries and subscriptions.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {entries.map(([slug, f]) => (
          <Link
            key={slug}
            href={`/features/${slug}`}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
          >
            <div className="text-lg font-semibold">{f.title}</div>
            <p className="mt-1 text-sm text-white/70">{f.tagline}</p>
            <div className="mt-3 text-xs text-white/60">Learn more →</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
