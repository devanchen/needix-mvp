// app/api/subscriptions/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const form = await req.formData();
  const service = String(form.get("service") ?? "").trim();
  const plan = (form.get("plan") ?? "") as string;
  const priceNum = Number(form.get("price"));
  const nextDateStr = String(form.get("nextDate") ?? "");
  const manageUrl = (form.get("manageUrl") ?? "") as string;

  if (!service || !nextDateStr || !Number.isFinite(priceNum)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const created = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      service,
      plan: plan || null,
      price: new Prisma.Decimal(priceNum),
      nextDate: new Date(nextDateStr),
      manageUrl: manageUrl || null,
      canceled: false,
    },
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

  return NextResponse.json({
    id: created.id,
    service: created.service,
    plan: created.plan ?? null,
    price: Number(created.price),
    nextDate: created.nextDate?.toISOString() ?? null,
    manageUrl: created.manageUrl ?? null,
    canceled: Boolean(created.canceled),
  });
}
