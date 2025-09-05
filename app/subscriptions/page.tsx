// app/subscriptions/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import SubscriptionsClient from "@/components/subscriptions/SubscriptionsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Next 15: searchParams is async
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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
  const sp = await searchParams;
  const selectedId = typeof sp.id === "string" ? sp.id : undefined;
  const defaultOpenCreate = sp.new === "1";

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="mt-3 text-white/80">
          Please <a className="underline" href="/signin">sign in</a> to manage your subscriptions.
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
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="mt-2 text-white/70">Track, add, and manage everything in one place.</p>
      </div>

      <SubscriptionsClient
        initialSubscriptions={initialSubscriptions}
        selectedId={selectedId}
        defaultOpenCreate={defaultOpenCreate}
      />
    </main>
  );
}
