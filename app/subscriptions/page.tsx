// app/subscriptions/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

// ✅ use relative imports to avoid alias hiccups
import SubscriptionForm from "../../components/subscriptions/SubscriptionForm";
import SubscriptionList from "../../components/subscriptions/SubscriptionList";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subscriptions • Needix",
};

export default async function SubscriptionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="mt-4 text-white/70">Please sign in to manage your subscriptions.</p>
      </main>
    );
  }

  // We cast to any[] so this file still compiles even if your local Prisma client
  // hasn't been regenerated yet for new columns like intervalDays / canceled.
  const rows = (await prisma.subscription.findMany({
    where: { userId: session.user.id },
    orderBy: [{ nextDate: "asc" }],
  })) as any[];

  const subs = rows.map((s) => ({
    id: s.id,
    userId: s.userId,
    service: s.service,
    plan: s.plan ?? null,
    manageUrl: s.manageUrl ?? null,
    price: s.price == null ? null : Number(s.price),
    nextDate: s.nextDate ? new Date(s.nextDate).toISOString() : null,

    // 👇 safe reads (works whether the columns exist locally or not)
    intervalDays: typeof s?.intervalDays === "number" ? s.intervalDays : null,
    canceled: typeof s?.canceled === "boolean" ? s.canceled : false,

    createdAt: new Date(s.createdAt).toISOString(),
    updatedAt: new Date(s.updatedAt).toISOString(),
  }));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Your subscriptions</h1>
      <p className="mt-2 text-white/70">
        Keep online subscriptions in one place. We’ll surface upcoming renewals.
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-semibold">Add a subscription</h2>
        <SubscriptionForm />
      </div>

      <div className="mt-8">
        <SubscriptionList initialSubs={subs} />
      </div>
    </main>
  );
}
