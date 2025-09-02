// components/dashboard/MonthlyTotal.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

function isPrismaDecimal(v: unknown): v is Prisma.Decimal {
  return typeof v === "object" && v !== null && typeof (v as { toNumber?: unknown }).toNumber === "function";
}
function toNumber(v: Prisma.Decimal | number | string | null): number | null {
  if (v === null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  if (isPrismaDecimal(v)) return v.toNumber();
  return null;
}

/** Convert price to an estimated monthly cost using intervalDays if present. */
function monthlyEquivalent(price: Prisma.Decimal | number | string | null, intervalDays: number | null): number {
  const p = toNumber(price);
  if (p == null) return 0;
  if (intervalDays && intervalDays > 0) {
    // 30-day month approximation
    return p * (30 / intervalDays);
  }
  return p; // assume monthly if interval unknown
}

export default async function MonthlyTotal() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const subs = await prisma.subscription.findMany({
    where: { userId, canceled: false },
    select: { price: true, intervalDays: true },
  });

  const total = subs.reduce((sum, s) => sum + monthlyEquivalent(s.price, s.intervalDays ?? null), 0);

  const fmt = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 2 });
  const pretty = fmt.format(Math.round(total * 100) / 100);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
      <div className="text-xs uppercase tracking-wide text-white/70">Estimated monthly total</div>
      <div className="mt-1 text-3xl font-extrabold">{pretty}</div>
      <div className="mt-1 text-[11px] text-white/60">
        Annual/other cadences normalized using <span className="font-medium">30-day</span> months.
      </div>
    </div>
  );
}
