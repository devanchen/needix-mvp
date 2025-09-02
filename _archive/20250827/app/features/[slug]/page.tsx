// app/features/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { FEATURES, type FeatureSlug } from "@/lib/features";

// Static params still fine as sync
export function generateStaticParams(): Array<{ slug: FeatureSlug }> {
  return (Object.keys(FEATURES) as FeatureSlug[]).map((slug) => ({ slug }));
}

// Note params is a Promise in Next 15
export default async function FeatureDetailPage({
  params,
}: {
  params: Promise<{ slug: FeatureSlug }>;
}) {
  const { slug } = await params; // <- await the params
  const data = FEATURES[slug];

  if (!data) return notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <nav className="text-sm text-white/60">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/features" className="hover:underline">Features</Link>
        <span className="mx-2">/</span>
        <span className="text-white/80">{data.title}</span>
      </nav>

      <h1 className="mt-3 text-3xl font-extrabold">{data.title}</h1>
      <p className="mt-2 text-white/80">{data.tagline}</p>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">What you get</h2>
        <ul className="mt-3 list-disc pl-5 text-white/80">
          {data.points.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </section>

      {!!data.proofs.length && (
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Proof points</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {data.proofs.map((p) => (
              <li key={p} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">{p}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/pricing" className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-gray-900 shadow hover:opacity-90">
          {data.ctaLabel ?? "Get started"}
        </Link>
        <Link href="/features" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-medium hover:bg-white/5">
          Back to all features
        </Link>
      </div>
    </main>
  );
}
