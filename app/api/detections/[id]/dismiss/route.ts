// app/api/detections/[id]/dismiss/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { Prisma } from "@prisma/client";

type Params = { params: { id: string } };

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  // Mark as dismissed using a strongly-typed JSON value (no `any`)
  const payload: Prisma.InputJsonValue = { dismissed: true };

  await prisma.detection.updateMany({
    where: { id: params.id, userId },
    data: { payload },
  });

  return NextResponse.json({ ok: true });
}
