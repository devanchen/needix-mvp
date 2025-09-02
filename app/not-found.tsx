// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-3 text-white/70">
        Oops. The page you’re looking for doesn’t exist.
      </p>
      <p className="mt-5">
        <Link href="/" className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
          Go home
        </Link>
      </p>
    </main>
  );
}
