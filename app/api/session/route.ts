// app/api/session/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ signedIn: false, user: null });

  const u = session.user;
  const id = typeof u.id === "string" ? u.id : null;
  const name = typeof u.name === "string" || u.name === null ? u.name : null;
  const email = typeof u.email === "string" || u.email === null ? u.email : null;
  const image = typeof u.image === "string" || u.image === null ? u.image : null;

  return NextResponse.json({ signedIn: true, user: { id, name, email, image } });
}
