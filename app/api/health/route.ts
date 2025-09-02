// app/api/health/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const env = {
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    hasDb: Boolean(process.env.DATABASE_URL),
    hasGoogle: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    hasStripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
  };

  let dbOk = false;
  try {
    // Lightweight DB ping
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  return NextResponse.json({ ok: true, env, dbOk }, { status: 200 });
}
