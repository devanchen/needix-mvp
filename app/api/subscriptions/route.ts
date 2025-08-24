// app/api/subscriptions/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionBody } from "@/lib/schemas";
import { getJson } from "@/lib/validate";

function toDTO(s: any) {
  return {
    id: s.id as string,
    userId: s.userId as string,
    service: s.service as string,
    plan: (s.plan ?? null) as string | null,
    manageUrl: (s.manageUrl ?? null) as string | null,
    price: s.price === null ? null : Number(s.price),
    nextDate: s.nextDate ? new Date(s.nextDate).toISOString() : null,
    createdAt: new Date(s.createdAt).toISOString(),
    updatedAt: new Date(s.updatedAt).toISOString(),
  };
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await getJson(req, SubscriptionBody);
  if (!body.ok) return body.error;

  const { service, plan, manageUrl, price, nextDate } = body.data;

  // Resolve/create a DB user
  const email = (session.user.email ?? "").toLowerCase().trim();
  let user =
    (session.user.id &&
      (await prisma.user.findUnique({ where: { id: session.user.id as string } }))) || null;

  if (!user && email) {
    user = await prisma.user.upsert({
      where: { email },
      update: { name: session.user.name ?? "User" },
      create: { email, name: session.user.name ?? "User" },
    });
  }
  if (!user) {
    user = await prisma.user.create({
      data: { email: email || `user_${Date.now()}@example.com`, name: session.user.name ?? "User" },
    });
  }

  // Build data, include optionals only when present (avoids TS/Prisma input complaints)
  const data: any = { userId: user.id, service };
  if (plan !== undefined) data.plan = plan;
  if (manageUrl !== undefined) data.manageUrl = manageUrl;
  if (price !== undefined && price !== null) data.price = price;
  if (nextDate !== undefined && nextDate !== null) data.nextDate = new Date(nextDate);

  const sub = await prisma.subscription.create({ data });
  return NextResponse.json(toDTO(sub), { status: 201 });
}
