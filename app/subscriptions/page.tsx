// app/subscriptions/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SubscriptionsClient from "@/components/subscriptions/SubscriptionsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Next 15: searchParams is async — await it before reading.
type SearchParams =
  Promise<Record<string, string | string[] | undefined>>;

function toNum(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  if (
    typeof v === "object" &&
    v !== null &&
    typeof (v as { toNumber?: unknown }).toNumber === "function"
  ) {
    const n = (v as { toNumber: () => number }).toNumber();
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // ✅ Must await in Next 15
  const sp = await searchParams;

  const selectedId =
    typeof sp.id === "string" ? sp.id : undefined;

  const createNew = sp.new === "1";

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="mt-3 text-white/80">
          Please{" "}
          <a className="underline" href="/signin">
            sign in
          </a>{" "}
          to manage your subscriptions.
        </p>
      </main>
    );
  }

  const subs = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { nextDate: "asc" },
    select: {
      id: true,
      service: true,
      plan: true,
      price: true,
      nextDate: true,
      manageUrl: true,
      canceled: true,
    },
  });

  // Serialize for client (Decimal/Date → primitives)
  const initialSubscriptions = subs.map((s) => ({
    id: s.id,
    service: s.service,
    plan: s.plan ?? null,
    price: toNum(s.price),
    nextDate: s.nextDate ? s.nextDate.toISOString() : null,
    manageUrl: s.manageUrl ?? null,
    canceled: Boolean(s.canceled),
  }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="mt-2 text-white/70">
            Manage your auto-reorders in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/subscriptions?new=1"
            className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
          >
            + New
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
          >
            Back to dashboard
          </Link>
        </div>
      </div>

      {(selectedId || createNew) && (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-white/80">
          {selectedId ? (
            <>
              Editing subscription{" "}
              <span className="font-mono">{selectedId}</span>. Scroll to it
              below and click <strong>Edit</strong>.
            </>
          ) : (
            <>Creating a new subscription — fill out the form below.</>
          )}
        </div>
      )}

      <SubscriptionsClient
        initialSubscriptions={initialSubscriptions}
        selectedId={selectedId}
      />
    </main>
  );
}
