import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

type ParamsP = { params: Promise<{ id: string }> };

interface UpdateData {
  service: string;
  plan: string | null;
  price: Prisma.Decimal;
  nextDate: Date;
  manageUrl: string | null;
}

export async function DELETE(_req: Request, ctx: ParamsP) {
  const { id } = await ctx.params;             // ← await params
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  // Avoid P2025 and ensure user ownership
  const result = await prisma.subscription.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (result.count === 0) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(req: Request, ctx: ParamsP) {
  const { id } = await ctx.params;             // ← await params
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const existing = await prisma.subscription.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!existing) return new NextResponse("Not found", { status: 404 });
  if (existing.userId !== session.user.id) return new NextResponse("Forbidden", { status: 403 });

  const form = await req.formData();

  const service = (form.get("service") ?? "").toString().trim();
  const plan = (form.get("plan") ?? "").toString().trim() || null;
  const price = form.get("price");
  const nextDate = (form.get("nextDate") ?? "").toString().trim();
  const manageUrl = (form.get("manageUrl") ?? "").toString().trim() || null;

  const data: Partial<UpdateData> = {};
  if (service) data.service = service;
  if (plan !== undefined) data.plan = plan;

  if (price != null && price !== "") {
    const n = Number(price);
    if (!Number.isFinite(n)) return new NextResponse("Invalid price", { status: 400 });
    data.price = new Prisma.Decimal(n);
  }

  if (nextDate) {
    const d = new Date(nextDate);
    if (Number.isNaN(d.getTime())) return new NextResponse("Invalid date", { status: 400 });
    data.nextDate = d;
  }

  data.manageUrl = manageUrl;

  const updated = await prisma.subscription.update({
    where: { id },
    data,
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
    id: updated.id,
    service: updated.service,
    plan: updated.plan ?? null,
    price: updated.price ? Number(updated.price) : null,
    nextDate: updated.nextDate ? updated.nextDate.toISOString() : null,
    manageUrl: updated.manageUrl ?? null,
    canceled: Boolean(updated.canceled),
  });
}
