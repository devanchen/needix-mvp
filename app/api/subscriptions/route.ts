// app/api/subscriptions/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Body = {
  service?: string;
  plan?: string | null;
  manageUrl?: string | null;
  price?: number | string | null;
  nextDate?: string | null; // "YYYY-MM-DD"
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = (await req.json()) as Body;

  // Basic normalization/validation
  const service = (raw.service ?? "").toString().trim();
  const plan = raw.plan ? String(raw.plan).trim() : null;
  const manageUrl = raw.manageUrl ? String(raw.manageUrl).trim() : null;

  if (!service) {
    return NextResponse.json({ error: "Service is required" }, { status: 400 });
  }

  // Get or create a real DB user (covers demo credentials flow)
  const email = (session.user.email ?? "").toLowerCase().trim();
  let user =
    (session.user.id &&
      (await prisma.user.findUnique({ where: { id: session.user.id as string } }))) ||
    null;

  if (!user && email) {
    user = await prisma.user.upsert({
      where: { email },
      update: { name: session.user.name ?? "User" },
      create: { email, name: session.user.name ?? "User" },
    });
  }

  if (!user) {
    // Last-resort fallback if no email on the session
    user = await prisma.user.create({
      data: {
        email: email || `user_${Date.now()}@example.com`,
        name: session.user.name ?? "User",
      },
    });
  }

  // Build create data and only include optional fields when present
  const data: any = {
    userId: user.id,
    service,
  };
  if (plan) data.plan = plan;
  if (manageUrl) data.manageUrl = manageUrl;

  if (
    raw.price !== undefined &&
    raw.price !== null &&
    String(raw.price).trim() !== ""
  ) {
    data.price = Number(raw.price);
  }

  if (raw.nextDate && raw.nextDate !== "") {
    // Prisma accepts Date or ISO string; use Date for clarity
    data.nextDate = new Date(raw.nextDate);
  }

  const sub = await prisma.subscription.create({ data });

  return NextResponse.json(sub, { status: 201 });
}
