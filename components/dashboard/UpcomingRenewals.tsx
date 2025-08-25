// components/dashboard/UpcomingRenewals.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const runtime = "nodejs";

function fmtUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default async function UpcomingRenewals() {
  const session = await auth();
  const userId = (session?.user?.id as string) || null;
  if (!userId) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);

  // Only rows with a nextDate within [today, today + 30]
  const subs = await prisma.subscription.findMany({
    where: {
      userId,
      nextDate: { gte: today, lte: in30 },
    },
    orderBy: { nextDate: "asc" },
    select: {
      id: true,
      service: true,
      plan: true,
      price: true,
      nextDate: true,
      manageUrl: true,
    },
  });

  const monthlyTotal = subs.reduce((sum, s) => sum + (s.price ? Number(s.price) : 0), 0);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Upcoming renewals</h2>
          <p className="text-sm text-white/70">Next 30 days</p>
        </div>
        <div className="text-sm">
          <span className="mr-2 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1">
            {subs.length} due
          </span>
          <span className="rounded-lg bg-white px-2.5 py-1 font-medium text-gray-900">
            {fmtUSD(monthlyTotal)}
          </span>
        </div>
      </div>

      {subs.length === 0 ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
          Nothing due in the next month.{" "}
          <Link href="/subscriptions?add=1" className="underline underline-offset-2 hover:opacity-90">
            Add your first subscription
          </Link>{" "}
          or set a <span className="font-medium">Next date</span> on existing ones.
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-white/70">
              <tr>
                <th className="px-4 py-2">Service</th>
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Due</th>
                <th className="px-4 py-2">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {subs.map((s) => (
                <tr key={s.id} className="bg-white/[0.02] hover:bg-white/[0.04]">
                  <td className="px-4 py-2 font-medium">{s.service}</td>
                  <td className="px-4 py-2">{s.plan || "—"}</td>
                  <td className="px-4 py-2">{s.price == null ? "—" : fmtUSD(Number(s.price))}</td>
                  <td className="px-4 py-2">
                    {s.nextDate ? new Date(s.nextDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {s.manageUrl ? (
                      <a
                        href={s.manageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white underline underline-offset-2 opacity-90 hover:opacity-100"
                      >
                        Open
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
