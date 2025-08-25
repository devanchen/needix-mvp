// app/api/subscriptions/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function toDTO(s: any) {
  return {
    id: s.id,
    userId: s.userId,
    service: s.service,
    plan: s.plan ?? null,
    manageUrl: s.manageUrl ?? null,
    price: s.price == null ? null : Number(s.price),
    nextDate: s.nextDate ? new Date(s.nextDate).toISOString() : null,
    intervalDays: typeof s.intervalDays === "number" ? s.intervalDays : null,
    canceled: typeof s.canceled === "boolean" ? s.canceled : false,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

// GET /api/subscriptions — list current user's subs
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.subscription.findMany({
    where: { userId },
    orderBy: [{ nextDate: "asc" }],
  });

  return NextResponse.json(rows.map(toDTO));
}

// POST /api/subscriptions — create a sub
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = userId as string;

  const body = (await req.json().catch(() => null)) as
    | {
        service?: string;
        plan?: string | null;
        manageUrl?: string | null;
        price?: number | string | null;
        nextDate?: string | null; // YYYY-MM-DD or ISO
        intervalDays?: number | null;
        canceled?: boolean | null;
      }
    | null;

  const service = String(body?.service || "").trim();
  if (!service) return NextResponse.json({ error: "Service is required" }, { status: 400 });

  const plan =
    typeof body?.plan === "string" && body.plan.trim() !== "" ? body.plan.trim() : null;

  const manageUrl =
    typeof body?.manageUrl === "string" && body.manageUrl.trim() !== ""
      ? body.manageUrl.trim()
      : null;

  // price: accept number or numeric string; null/empty -> omit
  let price: number | null = null;
  if (body?.price !== undefined && body.price !== null && body.price !== "") {
    const n = Number(body.price);
    price = Number.isFinite(n) ? n : null;
  }

  // nextDate: parse YYYY-MM-DD or ISO; empty -> omit
  let nextDate: Date | null = null;
  if (typeof body?.nextDate === "string" && body.nextDate.trim() !== "") {
    const dt = new Date(body.nextDate);
    if (!Number.isNaN(dt.getTime())) nextDate = dt;
  }

  // intervalDays: positive integer or null -> omit
  let intervalDays: number | null = null;
  if (body?.intervalDays !== undefined && body.intervalDays !== null) {
    const n = Number(body.intervalDays);
    intervalDays = Number.isFinite(n) && n > 0 ? n : null;
  }

  const canceled =
    typeof body?.canceled === "boolean" ? body.canceled : undefined;

  // Build create data as a plain object, then cast on the Prisma call
  const createData: Record<string, any> = { userId: uid, service };
  if (plan !== null) createData.plan = plan;
  if (manageUrl !== null) createData.manageUrl = manageUrl;
  if (price !== null) createData.price = price;
  if (nextDate !== null) createData.nextDate = nextDate;
  if (intervalDays !== null) createData.intervalDays = intervalDays;
  if (canceled !== undefined) createData.canceled = canceled;

  const created = await prisma.subscription.create({
    // Cast keeps TS happy even if your generated Prisma types lag a bit
    data: createData as any,
  });

  return NextResponse.json(toDTO(created), { status: 201 });
}
