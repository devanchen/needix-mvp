// app/subscriptions/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

// ✅ relative imports
import SubscriptionForm from "../../components/subscriptions/SubscriptionForm";
import SubscriptionList from "../../components/subscriptions/SubscriptionList";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subscriptions • Needix",
};

type SP = Record<string, string | string[] | undefined>;

/** Plain serializable DTO we pass to the Client Component */
export type SubscriptionDTO = {
  id: string;
  userId: string;
  service: string;
  plan: string | null;
  manageUrl: string | null;
  price: number | null;       // number, not Decimal
  nextDate: string | null;    // ISO string or null
  createdAt: string;          // ISO
  updatedAt: string;          // ISO
};

function atStartOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function SubscriptionsPage({
  // Next 15: searchParams is async
  searchParams,
}: {
  searchParams?: Promise<SP>;
}) {
  noStore();

  const session = await auth();

  if (!session?.user) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="mt-4 text-white/70">Please sign in to manage your subscriptions.</p>
      </main>
    );
  }

  // Resolve DB user by id or email (covers older sessions)
  const email = (session.user.email ?? "").toLowerCase().trim();
  let dbUser =
    (session.user.id &&
      (await prisma.user.findUnique({ where: { id: session.user.id as string } }))) ||
    null;

  if (!dbUser && email) {
    dbUser = await prisma.user.upsert({
      where: { email },
      update: { name: session.user.name ?? "User" },
      create: { email, name: session.user.name ?? "User" },
    });
  }

  // Load & serialize subscriptions → plain JSON
  let subs: SubscriptionDTO[] = [];
  let loadError = false;
  try {
    if (!dbUser) throw new Error("No DB user resolved");
    const rows = await prisma.subscription.findMany({
      where: { userId: dbUser.id },
      orderBy: [{ nextDate: "asc" }],
    });

    subs = rows.map((s) => ({
      id: s.id,
      userId: s.userId,
      service: s.service,
      plan: s.plan,
      manageUrl: s.manageUrl,
      price: s.price === null ? null : Number(s.price),
      nextDate: s.nextDate ? s.nextDate.toISOString() : null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
  } catch (e) {
    console.error("Subscriptions query failed:", e);
    loadError = true;
  }

  const hasSubs = subs.length > 0;

  // Derive summary metrics
  const today = atStartOfDay(new Date());
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);

  const totalSubs = subs.length;
  const monthlyTotal = subs.reduce((sum, s) => sum + (s.price ?? 0), 0);
  const dueNext30 = subs.filter((s) => {
    if (!s.nextDate) return false;
    const d = atStartOfDay(new Date(s.nextDate));
    return d >= today && d <= in30;
  }).length;
  const overdue = subs.filter((s) => {
    if (!s.nextDate) return false;
    const d = atStartOfDay(new Date(s.nextDate));
    return d < today;
  }).length;

  const fmtCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  // Handle ?add=1
  const sp = (await searchParams) ?? undefined;
  const wantsFormParam = Array.isArray(sp?.add) ? sp?.add?.[0] : sp?.add;
  const wantsForm = wantsFormParam === "1";
  const showForm = hasSubs || wantsForm;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Your subscriptions</h1>
      <p className="mt-2 text-white/70">
        Keep online subscriptions in one place. We’ll surface upcoming renewals.
      </p>

      {/* Summary cards */}
      {hasSubs && (
        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-white/60">Total subscriptions</div>
            <div className="mt-1 text-2xl font-semibold">{totalSubs}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-white/60">Monthly total</div>
            <div className="mt-1 text-2xl font-semibold">{fmtCurrency.format(monthlyTotal)}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-white/60">Due in next 30 days</div>
            <div className="mt-1 text-2xl font-semibold">{dueNext30}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-white/60">Overdue</div>
            <div className={`mt-1 text-2xl font-semibold ${overdue > 0 ? "text-red-300" : ""}`}>{overdue}</div>
          </div>
        </section>
      )}

      {loadError && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <div className="font-semibold">We couldn’t load your subscriptions.</div>
          <div className="mt-1 opacity-80">
            Please refresh in a moment. If this keeps happening, try signing out and back in.
          </div>
        </div>
      )}

      {!loadError && !hasSubs && (
        <section className="mt-6 rounded-2xl border border-white/10 p-8 text-center">
          <h2 className="text-xl font-semibold">No subscriptions yet</h2>
          <p className="mt-2 text-white/70">
            Track delivery dates and automate re-orders here once you add your first subscription.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5"
            >
              Learn how it works
            </Link>
            <Link
              href="/subscriptions?add=1#add-subscription"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:opacity-90"
            >
              Add your first subscription
            </Link>
          </div>
        </section>
      )}

      {showForm && (
        <div id="add-subscription" className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-semibold">Add a subscription</h2>
          <SubscriptionForm />
        </div>
      )}

      {hasSubs && (
        <div className="mt-8">
          <SubscriptionList initialSubs={subs} />
        </div>
      )}
    </main>
  );
}
