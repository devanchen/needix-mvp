// app/api/subscriptions/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type PostBody = Partial<{
  service: string;
  plan: string | null;
  price: number | null;
  nextDate: string | null; // ISO
  manageUrl: string | null;
  canceled: boolean;
}>;

function parsePost(raw: unknown): PostBody {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    service: typeof o.service === "string" ? o.service : undefined,
    plan: typeof o.plan === "string" ? o.plan : o.plan === null ? null : undefined,
    price: typeof o.price === "number" ? o.price : o.price === null ? null : undefined,
    nextDate: typeof o.nextDate === "string" ? o.nextDate : o.nextDate === null ? null : undefined,
    manageUrl: typeof o.manageUrl === "string" ? o.manageUrl : o.manageUrl === null ? null : undefined,
    canceled: typeof o.canceled === "boolean" ? o.canceled : undefined,
  };
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await prisma.subscription.findMany({
    where: { userId },
    orderBy: [{ canceled: "asc" }, { nextDate: "asc" }],
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

  return NextResponse.json({ items: list });
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = parsePost(await req.json().catch(() => ({})));
  if (!body.service || body.service.trim().length === 0) {
    return NextResponse.json({ error: "Service is required." }, { status: 400 });
  }

  // Validate nextDate (cannot be in the past)
  let next: Date | null = null;
  if (body.nextDate !== undefined) {
    next = body.nextDate ? new Date(body.nextDate) : null;
    if (next) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (next < today) {
        return NextResponse.json({ error: "nextDate cannot be in the past." }, { status: 400 });
      }
    }
  }

  const created = await prisma.subscription.create({
    data: {
      userId,
      service: body.service.trim(),
      plan: body.plan ?? null,
      price: body.price ?? null,
      nextDate: next,
      manageUrl: body.manageUrl ?? null,
      canceled: body.canceled ?? false,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
