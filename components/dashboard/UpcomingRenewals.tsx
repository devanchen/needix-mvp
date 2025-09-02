// components/dashboard/UpcomingRenewals.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

function isPrismaDecimal(val: unknown): val is Prisma.Decimal {
  return (
    typeof val === "object" &&
    val !== null &&
    // Prisma.Decimal has toNumber()
    typeof (val as { toNumber?: unknown }).toNumber === "function"
  );
}

function toNumber(
  v: Prisma.Decimal | number | string | null
): number | null {
  if (v === null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  if (isPrismaDecimal(v)) return v.toNumber();
  return null;
}

function formatPrice(
  v: Prisma.Decimal | number | string | null
): string {
  const n = toNumber(v);
  return n == null ? "—" : `$${n.toFixed(2)}`;
}

function formatDate(d: Date | null): string {
  return d ? new Date(d).toLocaleDateString() : "—";
}

export default async function UpcomingRenewals() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/80">
        Sign in to see upcoming renewals.
      </div>
    );
  }

  const items = await prisma.subscription.findMany({
    where: {
      userId,
      canceled: false,
      nextDate: { not: null },
    },
    orderBy: { nextDate: "asc" },
    take: 8,
    select: {
      id: true,
      service: true,
      plan: true,
      price: true,      // Prisma.Decimal | null
      nextDate: true,   // Date | null
      manageUrl: true,
    },
  });

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/80">
        No upcoming renewals.{" "}
        <Link className="underline" href="/subscriptions?new=1">
          Add one
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-sm font-semibold">Upcoming renewals</div>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2"
          >
            <div className="min-w-0">
              <div className="truncate font-medium">{s.service}</div>
              <div className="text-xs text-white/70">
                {s.plan ?? "—"} • {formatPrice(s.price)} • {formatDate(s.nextDate)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {s.manageUrl && (
                <a
                  href={s.manageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs hover:bg-white/[0.15]"
                >
                  Manage
                </a>
              )}
              <Link
                href={`/subscriptions?id=${s.id}`}
                className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs hover:bg-white/[0.15]"
                title="Edit in Subscriptions"
              >
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
