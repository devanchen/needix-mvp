// app/dashboard/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import UpcomingRenewals from "@/components/dashboard/UpcomingRenewals";
import MonthlyTotal from "@/components/dashboard/MonthlyTotal";
import NextPaymentBanner from "@/components/dashboard/NextPaymentBanner";
import Link from "next/link";

export const dynamic = "force-dynamic";
const ACTIVE_STATES = new Set(["active", "trialing"]);

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-3 text-white/80">
          Please <a className="underline" href="/signin">sign in</a> to view your dashboard.
        </p>
      </main>
    );
  }

  const membership = await prisma.membership.findUnique({ where: { userId } });
  const active = membership?.status ? ACTIVE_STATES.has(membership.status) : false;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/subscriptions?new=1"
          className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-sm hover:bg-emerald-400/15"
        >
          Add subscription
        </Link>
      </div>

      {/* Top reminder for most-imminent payment */}
      <NextPaymentBanner />

      {/* Membership state card */}
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-sm">
          Membership status:{" "}
          <span className={active ? "text-emerald-300" : "text-white/80"}>
            {active ? "Active" : (membership?.status ?? "—")}
          </span>
        </div>
      </div>

      {/* Center: monthly total tracker */}
      <div className="mt-6">
        <MonthlyTotal />
      </div>

      {/* Upcoming renewals module */}
      <div className="mt-6">
        <UpcomingRenewals />
      </div>
    </main>
  );
}
