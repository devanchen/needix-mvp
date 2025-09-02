// components/dashboard/NextPaymentBanner.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString();
}
function daysUntil(d: Date): string {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(0, 0, 0, 0);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
}
function isDecimal(v: unknown): v is Prisma.Decimal {
  return typeof v === "object" && v !== null && typeof (v as { toNumber?: unknown }).toNumber === "function";
}
function priceText(p: Prisma.Decimal | number | string | null): string {
  if (p == null) return "—";
  const n = typeof p === "number" ? p : typeof p === "string" ? Number(p) : isDecimal(p) ? p.toNumber() : NaN;
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : "—";
}

export default async function NextPaymentBanner() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  // upcoming = nextDate today or future
  const now = new Date();
  const next = await prisma.subscription.findFirst({
    where: {
      userId,
      canceled: false,
      nextDate: { gte: now },
    },
    orderBy: { nextDate: "asc" },
    select: { id: true, service: true, nextDate: true, price: true, manageUrl: true },
  });

  if (!next) return null;

  return (
    <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <span className="mr-2">⏰</span>
          <span className="font-semibold">{next.service}</span>{" "}
          <span className="text-white/80">renews {daysUntil(next.nextDate!)} • {formatDate(next.nextDate!)} • {priceText(next.price)}</span>
        </div>
        <div className="flex items-center gap-2">
          {next.manageUrl && (
            <a
              href={next.manageUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
            >
              Manage
            </a>
          )}
          <Link
            href={`/subscriptions?id=${next.id}`}
            className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}
