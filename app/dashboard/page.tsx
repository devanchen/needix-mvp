// app/dashboard/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ConnectSubscriptions from "@/components/integrations/ConnectSubscriptions";
import UpcomingRenewals from "@/components/dashboard/UpcomingRenewals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard • Needix",
};

function fmtUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-white/70">
          Please{" "}
          <Link href="/signin" className="underline underline-offset-2 hover:opacity-90">
            sign in
          </Link>{" "}
          to view your dashboard.
        </p>
      </main>
    );
  }

  const userId = session.user.id as string;

  // Time window for "upcoming"
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);

  // Stats + Gmail connection status
  const [totalSubs, upcomingCount, upcomingRows, googleAccount] = await Promise.all([
    prisma.subscription.count({ where: { userId } }),
    prisma.subscription.count({ where: { userId, nextDate: { gte: today, lte: in30 } } }),
    prisma.subscription.findMany({
      where: { userId, nextDate: { gte: today, lte: in30 } },
      select: { price: true },
    }),
    prisma.account.findFirst({ where: { userId, provider: "google" }, select: { id: true } }),
  ]);

  const googleConnected = !!googleAccount;
  const upcomingTotal = upcomingRows.reduce((sum, s) => sum + (s.price ? Number(s.price) : 0), 0);

  const displayName =
    (session.user.name && session.user.name.trim()) ||
    (session.user.email && session.user.email.trim()) ||
    "there";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      {/* Header / Greeting */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {displayName.split("@")[0]} 👋</h1>
          <p className="mt-1 text-white/70 text-sm">
            Track subscriptions, see what’s due soon, and connect your inbox to auto-detect more.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/subscriptions?add=1"
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:opacity-90"
          >
            Add subscription
          </Link>
          <Link
            href="/subscriptions"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Manage all
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/70">Total subscriptions</div>
          <div className="mt-1 text-2xl font-semibold">{totalSubs}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/70">Due next 30 days</div>
          <div className="mt-1 text-2xl font-semibold">{upcomingCount}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/70">Upcoming total</div>
          <div className="mt-1 text-2xl font-semibold">{fmtUSD(upcomingTotal)}</div>
        </div>
      </section>

      {/* Onboarding nudge when empty */}
      {totalSubs === 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">Get started</h2>
          <p className="mt-1 text-sm text-white/70">
            Add your first subscription or connect Gmail to auto-detect ones from receipts.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/subscriptions?add=1"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:opacity-90"
            >
              Add subscription
            </Link>
            {!googleConnected ? (
              <Link
                href="/integrations/gmail/connected"
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                Connect Gmail
              </Link>
            ) : (
              <Link
                href="/integrations/gmail/preview"
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                Preview imports
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Connect Subscriptions (only when not connected) */}
      {!googleConnected && <ConnectSubscriptions />}

      {/* If connected, show a tiny status card with quick actions */}
      {googleConnected && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Gmail connected</h2>
              <p className="text-sm text-white/70">You can preview candidates or run a quick scan.</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/integrations/gmail/preview"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:opacity-90"
              >
                Preview & import
              </Link>
              <Link
                href="/integrations/gmail/connected"
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                Scan inbox
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming renewals table */}
      <UpcomingRenewals />
    </main>
  );
}
