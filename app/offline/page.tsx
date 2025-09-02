// app/offline/page.tsx
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold">You’re offline</h1>
      <p className="mt-3 text-white/70">
        This page isn’t available without a network connection.
      </p>
      <p className="mt-5">
        <Link href="/" className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
          Try home
        </Link>
      </p>
    </main>
  );
}
